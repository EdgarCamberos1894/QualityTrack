package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocument;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomerRequestSubmissionService {

    private static final String DEFAULT_DOCUMENT_TYPE = "REQUEST_ATTACHMENT";
    private static final String DEFAULT_DOCUMENT_NAME = "Documento adjunto";

    private final CustomerRequestService customerRequestService;
    private final DocumentService documentService;
    private final int maxFilesPerRequest;

    public CustomerRequestSubmissionService(
            CustomerRequestService customerRequestService,
            DocumentService documentService,
            @Value("${app.documents.max-files-per-request:5}") int maxFilesPerRequest
    ) {
        if (maxFilesPerRequest < 1) {
            throw new IllegalStateException("DOCUMENT_MAX_FILES_PER_REQUEST must be greater than zero.");
        }

        this.customerRequestService = customerRequestService;
        this.documentService = documentService;
        this.maxFilesPerRequest = maxFilesPerRequest;
    }

    @Transactional
    public CustomerRequestResponse submit(
            Long currentUserId,
            Long customerId,
            SubmitCustomerRequest input,
            List<MultipartFile> files,
            List<CreateRequestDocument> metadata
    ) {
        List<InitialDocumentUpload> documents = pairDocuments(files, metadata);

        CustomerRequestResponse response = customerRequestService.submit(
                currentUserId,
                customerId,
                input
        );

        if (documents.isEmpty()) {
            return response;
        }

        Long caseId = response.jobCase().id();

        for (InitialDocumentUpload document : documents) {
            MultipartFile file = document.file();
            CreateRequestDocument documentMetadata = document.metadata();

            documentService.create(
                    currentUserId,
                    new CreateDocumentRequest(
                            caseId,
                            documentType(documentMetadata),
                            documentName(documentMetadata, file),
                            documentMetadata == null ? null : documentMetadata.description()
                    ),
                    file
            );
        }

        return response;
    }

    private List<InitialDocumentUpload> pairDocuments(
            List<MultipartFile> files,
            List<CreateRequestDocument> metadata
    ) {
        boolean hasFiles = files != null && !files.isEmpty();
        boolean hasMetadata = metadata != null && !metadata.isEmpty();

        if (!hasFiles) {
            if (hasMetadata) {
                throw new BusinessException(
                        ApiErrorCode.VALIDATION_ERROR,
                        "No puedes enviar metadata de documentos sin adjuntar archivos."
                );
            }
            return List.of();
        }

        if (files.size() > maxFilesPerRequest) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "Puedes adjuntar como máximo " + maxFilesPerRequest + " documentos por solicitud."
            );
        }

        if (files.stream().anyMatch(file -> file == null)) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "Cada documento debe incluir un archivo."
            );
        }

        if (hasMetadata && metadata.size() != files.size()) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "documentsMetadata debe contener exactamente un elemento por cada archivo enviado en documents."
            );
        }

        List<InitialDocumentUpload> documents = new ArrayList<>(files.size());
        for (int index = 0; index < files.size(); index++) {
            CreateRequestDocument documentMetadata = hasMetadata
                    ? metadata.get(index)
                    : null;
            documents.add(new InitialDocumentUpload(documentMetadata, files.get(index)));
        }

        return List.copyOf(documents);
    }

    private String documentType(CreateRequestDocument metadata) {
        if (metadata == null
                || metadata.documentType() == null
                || metadata.documentType().isBlank()) {
            return DEFAULT_DOCUMENT_TYPE;
        }
        return metadata.documentType().trim();
    }

    private String documentName(CreateRequestDocument metadata, MultipartFile file) {
        if (metadata != null && metadata.name() != null && !metadata.name().isBlank()) {
            return metadata.name().trim();
        }

        if (file.getOriginalFilename() == null) {
            return DEFAULT_DOCUMENT_NAME;
        }

        String normalized = file.getOriginalFilename()
                .replace('\\', '/')
                .replace("\r", "")
                .replace("\n", "")
                .trim();

        int separator = normalized.lastIndexOf('/');
        String fileName = separator >= 0
                ? normalized.substring(separator + 1).trim()
                : normalized;

        return fileName.isBlank() ? DEFAULT_DOCUMENT_NAME : fileName;
    }

    private record InitialDocumentUpload(
            CreateRequestDocument metadata,
            MultipartFile file
    ) {
    }
}
