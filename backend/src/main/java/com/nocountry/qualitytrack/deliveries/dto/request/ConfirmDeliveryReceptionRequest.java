package com.nocountry.qualitytrack.deliveries.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmDeliveryReceptionRequest(
        @NotBlank @Size(max = 160) String receivedByName,
        Long evidenceDocumentVersionId
) {
}
