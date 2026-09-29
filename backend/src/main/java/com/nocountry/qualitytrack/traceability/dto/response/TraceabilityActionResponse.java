package com.nocountry.qualitytrack.traceability.dto.response;

import com.nocountry.qualitytrack.traceability.enums.TraceabilityResourceType;

public record TraceabilityActionResponse(
        String label,
        TraceabilityResourceType resourceType,
        Long resourceId
) {
}
