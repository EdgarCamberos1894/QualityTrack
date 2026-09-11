package com.nocountry.qualitytrack.requests.dto.request;

import jakarta.validation.constraints.Size;

public record CreateRequestDocument(
        @Size(max = 50) String documentType,
        @Size(max = 255) String name,
        @Size(max = 2000) String description
) {
}
