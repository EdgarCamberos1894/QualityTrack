package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.documents.storage.DocumentStorage;
import com.nocountry.qualitytrack.documents.storage.DocumentStorageException;
import com.nocountry.qualitytrack.documents.storage.StoredDocumentFile;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final String DEFAULT_MIME_TYPE = "application/octet-stream";

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final JobCaseRepository jobCaseRepository;
    private final DocumentAccessService accessService;
    private final DocumentStorage storage;

    @Transactional
    public DocumentResponse create(
            Long currentUserId,
            CreateDocumentRequest input,
            MultipartFile file
    ) {
        validateFile(file);

        JobCase jobCase = jobCaseRepository.findById(input.caseId())
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el expediente."
                ));

        User uploader = accessService.requireCanCreate(currentUserId, jobCase);

        Document document = Document.create(
                jobCase,
                input.documentType().trim().toUpperCase(Locale.ROOT),
                input.name().trim(),
                normalizeNullable(input.description()),
                uploader
        );
        document = documentRepository.saveAndFlush(document);

        String fileName = sanitizeFileName(file.getOriginalFilename());
        String mimeType = normalizeMimeType(file.getContentType());
        StoredDocumentFile storedFile = storeFile(jobCase.getId(), 1, file);
        registerRollbackCleanup(storedFile.storageKey());

        DocumentVersion version = DocumentVersion.upload(
                document,
                1,
                fileName,
                storedFile.storageKey(),
                mimeType,
                storedFile.fileSize(),
                storedFile.checksum(),
                uploader
        );
        version = documentVersionRepository.saveAndFlush(version);

        return DocumentResponse.from(document, version);
    }

    @Transactional
    public DocumentVersionResponse addVersion(
            Long currentUserId,
            Long documentId,
            MultipartFile file
    ) {
        validateFile(file);

        Document document = documentRepository.findByIdForUpdate(documentId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el documento."
                ));

        User uploader = accessService.requireCanAddVersion(currentUserId, document);
        int nextVersion = documentVersionRepository.findMaxVersionByDocumentId(documentId) + 1;

        StoredDocumentFile storedFile = storeFile(document.getJobCase().getId(), nextVersion, file);
        registerRollbackCleanup(storedFile.storageKey());

        DocumentVersion version = DocumentVersion.upload(
                document,
                nextVersion,
                sanitizeFileName(file.getOriginalFilename()),
                storedFile.storageKey(),
                normalizeMimeType(file.getContentType()),
                storedFile.fileSize(),
                storedFile.checksum(),
                uploader
        );
        version = documentVersionRepository.saveAndFlush(version);

        return DocumentVersionResponse.from(version);
    }

    @Transactional(readOnly = true)
    public List<DocumentVersionResponse> listVersions(Long currentUserId, Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el documento."
                ));

        accessService.requireCanRead(currentUserId, document);

        return documentVersionRepository.findAllByDocument_IdOrderByVersionAsc(documentId)
                .stream()
                .map(DocumentVersionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentDownload download(
            Long currentUserId,
            Long documentId,
            Long versionId
    ) {
        DocumentVersion version = documentVersionRepository
                .findByIdAndDocument_Id(versionId, documentId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la versión del documento."
                ));

        accessService.requireCanRead(currentUserId, version.getDocument());

        try {
            Resource resource = storage.load(version.getStorageKey());
            long fileSize = version.getFileSize() == null
                    ? resource.contentLength()
                    : version.getFileSize();

            return new DocumentDownload(
                    resource,
                    version.getFileName(),
                    version.getMimeType(),
                    fileSize
            );
        } catch (IOException | DocumentStorageException exception) {
            throw storageUnavailable();
        }
    }

    private StoredDocumentFile storeFile(Long caseId, Integer version, MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            return storage.store(caseId, version, inputStream);
        } catch (IOException | DocumentStorageException exception) {
            throw storageUnavailable();
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(
                    ApiErrorCode.DOCUMENT_FILE_REQUIRED,
                    "Debes adjuntar un archivo no vacío."
            );
        }

        sanitizeFileName(file.getOriginalFilename());
    }

    private String sanitizeFileName(String originalFileName) {
        if (originalFileName == null) {
            throw invalidFileName();
        }

        String normalized = originalFileName
                .replace('\\', '/')
                .replace("\r", "")
                .replace("\n", "")
                .trim();

        int separator = normalized.lastIndexOf('/');
        String fileName = separator >= 0
                ? normalized.substring(separator + 1).trim()
                : normalized;

        if (fileName.isBlank() || fileName.length() > 255) {
            throw invalidFileName();
        }

        return fileName;
    }

    private BusinessException invalidFileName() {
        return new BusinessException(
                ApiErrorCode.VALIDATION_ERROR,
                "El nombre del archivo no es válido."
        );
    }

    private String normalizeMimeType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return DEFAULT_MIME_TYPE;
        }

        String normalized = contentType.trim();
        return normalized.length() <= 150 ? normalized : DEFAULT_MIME_TYPE;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private BusinessException storageUnavailable() {
        return new BusinessException(
                ApiErrorCode.DOCUMENT_STORAGE_ERROR,
                "No fue posible acceder al almacenamiento de documentos."
        );
    }

    private void registerRollbackCleanup(String storageKey) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != TransactionSynchronization.STATUS_COMMITTED) {
                    storage.deleteQuietly(storageKey);
                }
            }
        });
    }
}
