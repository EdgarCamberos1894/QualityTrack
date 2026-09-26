package com.nocountry.qualitytrack.workorders.dto.response;

import java.time.Instant;

public record WorkOrderDocumentResponse(
        Long id,
        Long documentId,
        String documentName,
        String documentType,
        Long documentVersionId,
        Integer version,
        String fileName,
        String mimeType,
        Long fileSize,
        String checksum,
        Long linkedByUserId,
        String linkedByName,
        Instant linkedAt
) {
}
