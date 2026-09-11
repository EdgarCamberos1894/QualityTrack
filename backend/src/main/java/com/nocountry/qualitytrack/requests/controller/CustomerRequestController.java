package com.nocountry.qualitytrack.requests.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentSummaryResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.service.DocumentDownload;
import com.nocountry.qualitytrack.requests.documentation.AddRequestDocumentVersionApiDocs;
import com.nocountry.qualitytrack.requests.documentation.CancelCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.CreateRequestDocumentApiDocs;
import com.nocountry.qualitytrack.requests.documentation.CustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.DownloadRequestDocumentVersionApiDocs;
import com.nocountry.qualitytrack.requests.documentation.GetCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.ListCustomerRequestsApiDocs;
import com.nocountry.qualitytrack.requests.documentation.ListRequestDocumentsApiDocs;
import com.nocountry.qualitytrack.requests.documentation.ListRequestDocumentVersionsApiDocs;
import com.nocountry.qualitytrack.requests.documentation.SubmitCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.dto.request.CancelCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocument;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.service.CustomerRequestDocumentService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestSubmissionService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/{customerId}/requests")
@RequiredArgsConstructor
@CustomerRequestApiDocs
public class CustomerRequestController {

    private final CustomerRequestService customerRequestService;
    private final CustomerRequestSubmissionService customerRequestSubmissionService;
    private final CustomerRequestDocumentService customerRequestDocumentService;

    @SubmitCustomerRequestApiDocs
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CustomerRequestResponse>> submit(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @Valid @RequestPart("request") SubmitCustomerRequest request,
            @RequestPart(value = "documents", required = false) List<MultipartFile> documents
    ) {
        CustomerRequestResponse response = customerRequestSubmissionService.submit(
                currentUserId,
                customerId,
                request,
                documents
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.CUSTOMER_REQUEST_SUBMITTED,
                        "Solicitud enviada correctamente.",
                        response
                ));
    }

    @ListCustomerRequestsApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerRequestResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        List<CustomerRequestResponse> response = customerRequestService
                .listForCustomer(currentUserId, customerId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUESTS_RETRIEVED,
                "Solicitudes consultadas correctamente.",
                response
        ));
    }

    @GetCustomerRequestApiDocs
    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<CustomerRequestResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId
    ) {
        CustomerRequestResponse response = customerRequestService
                .getForCustomer(currentUserId, customerId, requestId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUEST_RETRIEVED,
                "Solicitud consultada correctamente.",
                response
        ));
    }

    @CreateRequestDocumentApiDocs
    @PostMapping(value = "/{requestId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> createDocument(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @Valid @RequestPart(value = "metadata", required = false) CreateRequestDocument metadata,
            @RequestPart("file") MultipartFile file
    ) {
        DocumentResponse response = customerRequestDocumentService.create(
                currentUserId,
                customerId,
                requestId,
                metadata,
                file
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.DOCUMENT_CREATED,
                        "Documento agregado a la solicitud correctamente.",
                        response
                ));
    }

    @ListRequestDocumentsApiDocs
    @GetMapping("/{requestId}/documents")
    public ResponseEntity<ApiResponse<List<DocumentSummaryResponse>>> listDocuments(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId
    ) {
        List<DocumentSummaryResponse> response = customerRequestDocumentService.list(
                currentUserId,
                customerId,
                requestId
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENTS_RETRIEVED,
                "Documentos de la solicitud consultados correctamente.",
                response
        ));
    }

    @AddRequestDocumentVersionApiDocs
    @PostMapping(
            value = "/{requestId}/documents/{documentId}/versions",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<DocumentVersionResponse>> addDocumentVersion(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @PathVariable Long documentId,
            @RequestPart("file") MultipartFile file
    ) {
        DocumentVersionResponse response = customerRequestDocumentService.addVersion(
                currentUserId,
                customerId,
                requestId,
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

    @ListRequestDocumentVersionsApiDocs
    @GetMapping("/{requestId}/documents/{documentId}/versions")
    public ResponseEntity<ApiResponse<List<DocumentVersionResponse>>> listDocumentVersions(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @PathVariable Long documentId
    ) {
        List<DocumentVersionResponse> response = customerRequestDocumentService.listVersions(
                currentUserId,
                customerId,
                requestId,
                documentId
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENT_VERSIONS_RETRIEVED,
                "Versiones del documento consultadas correctamente.",
                response
        ));
    }

    @DownloadRequestDocumentVersionApiDocs
    @GetMapping("/{requestId}/documents/{documentId}/versions/{versionId}/content")
    public ResponseEntity<Resource> downloadDocumentVersion(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @PathVariable Long documentId,
            @PathVariable Long versionId
    ) {
        DocumentDownload download = customerRequestDocumentService.download(
                currentUserId,
                customerId,
                requestId,
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

    @CancelCustomerRequestApiDocs
    @PostMapping("/{requestId}/cancel")
    public ResponseEntity<ApiResponse<CustomerRequestResponse>> cancel(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) CancelCustomerRequest request
    ) {
        CustomerRequestResponse response = customerRequestService.cancel(
                currentUserId,
                customerId,
                requestId,
                request
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUEST_CANCELLED,
                "Solicitud cancelada correctamente.",
                response
        ));
    }

    private MediaType safeMediaType(String mimeType) {
        try {
            return MediaType.parseMediaType(mimeType);
        } catch (IllegalArgumentException exception) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
