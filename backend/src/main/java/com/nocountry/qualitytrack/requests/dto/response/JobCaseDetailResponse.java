package com.nocountry.qualitytrack.requests.dto.response;

import java.util.List;

public record JobCaseDetailResponse(
        JobCaseResponse jobCase,
        List<RequestDocumentResponse> documents
) {
    public static JobCaseDetailResponse from(
            JobCaseResponse jobCase,
            List<RequestDocumentResponse> documents
    ) {
        return new JobCaseDetailResponse(jobCase, documents);
    }
}
