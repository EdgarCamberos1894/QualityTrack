package com.nocountry.qualitytrack.documents.dto.response;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.CustomerDocumentSource;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentVersionResponse;
import com.nocountry.qualitytrack.users.enums.AccountType;

import java.time.Instant;

public record CustomerDocumentCenterResponse(
        Long id,
        Long caseId,
        Long requestId,
        String requestNumber,
        String requestTitle,
        String documentType,
        String name,
        String description,
        CustomerDocumentSource source,
        Instant createdAt,
        RequestDocumentVersionResponse currentVersion
) {

    public static CustomerDocumentCenterResponse from(
            Document document,
            DocumentVersion currentVersion,
            Long customerId
    ) {
        var jobCase = document.getJobCase();
        var request = jobCase.getCustomerRequest();
        CustomerDocumentSource source =
                document.getCreatedBy().getAccountType() == AccountType.CUSTOMER
                        ? CustomerDocumentSource.CUSTOMER_UPLOAD
                        : CustomerDocumentSource.DELIVERY_EVIDENCE;

        return new CustomerDocumentCenterResponse(
                document.getId(),
                jobCase.getId(),
                request.getId(),
                request.getRequestNumber(),
                request.getTitle(),
                document.getDocumentType(),
                document.getName(),
                document.getDescription(),
                source,
                document.getCreatedAt(),
                RequestDocumentVersionResponse.from(
                        DocumentVersionResponse.from(currentVersion),
                        customerId,
                        request.getId(),
                        document.getId()
                )
        );
    }
}
