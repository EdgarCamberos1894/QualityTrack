package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerRequestSubmissionService {

    private static final String INITIAL_DOCUMENT_TYPE = "REQUEST_ATTACHMENT";

    private final CustomerRequestService customerRequestService;
    private final DocumentService documentService;

    @Transactional
    public CustomerRequestResponse submit(
            Long currentUserId,
            Long customerId,
            SubmitCustomerRequest input,
            List<MultipartFile> documents
    ) {
        CustomerRequestResponse response = customerRequestService.submit(
                currentUserId,
                customerId,
                input
        );

        if (documents == null || documents.isEmpty()) {
            return response;
        }

        Long caseId = response.jobCase().id();

        for (MultipartFile document : documents) {
            documentService.create(
                    currentUserId,
                    new CreateDocumentRequest(
                            caseId,
                            INITIAL_DOCUMENT_TYPE,
                            initialDocumentName(document),
                            null
                    ),
                    document
            );
        }

        return response;
    }

    private String initialDocumentName(MultipartFile file) {
        if (file == null || file.getOriginalFilename() == null) {
            return "Documento adjunto";
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

        return fileName.isBlank() ? "Documento adjunto" : fileName;
    }
}
