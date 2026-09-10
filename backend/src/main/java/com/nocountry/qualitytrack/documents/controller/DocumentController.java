package com.nocountry.qualitytrack.documents.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.documents.documentation.AddDocumentVersionApiDocs;
import com.nocountry.qualitytrack.documents.documentation.CreateDocumentApiDocs;
import com.nocountry.qualitytrack.documents.documentation.DocumentApiDocs;
import com.nocountry.qualitytrack.documents.documentation.DownloadDocumentVersionApiDocs;
import com.nocountry.qualitytrack.documents.documentation.ListCaseDocumentsApiDocs;
import com.nocountry.qualitytrack.documents.documentation.ListDocumentVersionsApiDocs;
import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentSummaryResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.service.DocumentDownload;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@DocumentApiDocs
public class DocumentController {

    private final DocumentService documentService;

    @CreateDocumentApiDocs
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> create(
            @CurrentUserId Long currentUserId,
            @Valid @RequestPart("metadata") CreateDocumentRequest metadata,
            @RequestPart("file") MultipartFile file
    ) {
        DocumentResponse response = documentService.create(currentUserId, metadata, file);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.DOCUMENT_CREATED,
                        "Documento creado correctamente.",
                        response
                ));
    }

    @ListCaseDocumentsApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentSummaryResponse>>> listByCase(
            @CurrentUserId Long currentUserId,
            @RequestParam Long caseId
    ) {
        List<DocumentSummaryResponse> response = documentService.listByCase(
                currentUserId,
                caseId
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENTS_RETRIEVED,
                "Documentos del expediente consultados correctamente.",
                response
        ));
    }

    @AddDocumentVersionApiDocs
    @PostMapping(value = "/{documentId}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentVersionResponse>> addVersion(
            @CurrentUserId Long currentUserId,
            @PathVariable Long documentId,
            @RequestPart("file") MultipartFile file
    ) {
        DocumentVersionResponse response = documentService.addVersion(
                currentUserId,
                documentId,
                file
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.DOCUMENT_VERSION_CREATED,
                        "Nueva versión del documento creada correctamente.",
                        response
                ));
    }

    @ListDocumentVersionsApiDocs
    @GetMapping("/{documentId}/versions")
    public ResponseEntity<ApiResponse<List<DocumentVersionResponse>>> listVersions(
            @CurrentUserId Long currentUserId,
            @PathVariable Long documentId
    ) {
        List<DocumentVersionResponse> response = documentService.listVersions(
                currentUserId,
                documentId
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENT_VERSIONS_RETRIEVED,
                "Versiones del documento consultadas correctamente.",
                response
        ));
    }

    @DownloadDocumentVersionApiDocs
    @GetMapping("/{documentId}/versions/{versionId}/content")
    public ResponseEntity<Resource> download(
            @CurrentUserId Long currentUserId,
            @PathVariable Long documentId,
            @PathVariable Long versionId
    ) {
        DocumentDownload download = documentService.download(
                currentUserId,
                documentId,
                versionId
        );

        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(download.fileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(safeMediaType(download.mimeType()))
                .contentLength(download.fileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .body(download.resource());
    }

    private MediaType safeMediaType(String mimeType) {
        try {
            return MediaType.parseMediaType(mimeType);
        } catch (IllegalArgumentException exception) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
