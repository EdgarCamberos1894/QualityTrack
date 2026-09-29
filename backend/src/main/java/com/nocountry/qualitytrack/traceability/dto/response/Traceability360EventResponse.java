package com.nocountry.qualitytrack.traceability.dto.response;

import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record Traceability360EventResponse(
        Long id,
        TraceabilityAggregateType aggregateType,
        Long aggregateId,
        TraceabilityEventType eventType,
        String fromStatus,
        String toStatus,
        Long performedByUserId,
        String performedByName,
        Map<String, Object> metadata,
        Instant occurredAt,
        List<TraceabilityActionResponse> actions
) {
    public static Traceability360EventResponse from(
            TraceabilityEventResponse event,
            List<TraceabilityActionResponse> actions
    ) {
        return new Traceability360EventResponse(
                event.id(),
                event.aggregateType(),
                event.aggregateId(),
                event.eventType(),
                event.fromStatus(),
                event.toStatus(),
                event.performedByUserId(),
                event.performedByName(),
                event.metadata(),
                event.occurredAt(),
                actions == null ? List.of() : List.copyOf(actions)
        );
    }
}
