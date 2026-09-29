package com.nocountry.qualitytrack.traceability.service;

import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityResourceType;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TraceabilityActionResolverTest {

    private final TraceabilityActionResolver resolver = new TraceabilityActionResolver();

    @Test
    void documentReplacementExposesPreviousAndNewVersions() {
        TraceabilityEventResponse event = new TraceabilityEventResponse(
                100L,
                TraceabilityAggregateType.WORK_ORDER,
                7L,
                TraceabilityEventType.WORK_ORDER_DOCUMENT_PINNED,
                "CREATED",
                "CREATED",
                10L,
                "Ana López",
                Map.of(
                        "documentId", 5L,
                        "previousDocumentVersionId", 18L,
                        "previousVersion", 1,
                        "documentVersionId", 22L,
                        "version", 2
                ),
                Instant.parse("2026-09-28T18:00:00Z")
        );

        var actions = resolver.resolve(event);

        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.WORK_ORDER
                        && action.resourceId().equals(7L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.DOCUMENT
                        && action.resourceId().equals(5L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.label().equals("Ver versión anterior")
                        && action.resourceType() == TraceabilityResourceType.DOCUMENT_VERSION
                        && action.resourceId().equals(18L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.label().equals("Ver versión nueva")
                        && action.resourceType() == TraceabilityResourceType.DOCUMENT_VERSION
                        && action.resourceId().equals(22L)));
    }

    @Test
    void qualityRejectionLinksInspectionAndNonConformityWithoutDuplicates() {
        TraceabilityEventResponse event = new TraceabilityEventResponse(
                101L,
                TraceabilityAggregateType.QUALITY_INSPECTION,
                30L,
                TraceabilityEventType.QUALITY_INSPECTION_REJECTED,
                "IN_PROGRESS",
                "REJECTED",
                10L,
                "Ana López",
                Map.of(
                        "workOrderId", 7L,
                        "nonConformityId", 40L
                ),
                Instant.parse("2026-09-28T19:00:00Z")
        );

        var actions = resolver.resolve(event);

        assertEquals(3, actions.size());
        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.QUALITY_INSPECTION
                        && action.resourceId().equals(30L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.NON_CONFORMITY
                        && action.resourceId().equals(40L)));
    }
}
