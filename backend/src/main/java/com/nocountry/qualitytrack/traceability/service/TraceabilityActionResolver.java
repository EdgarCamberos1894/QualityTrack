package com.nocountry.qualitytrack.traceability.service;

import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityActionResponse;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityResourceType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TraceabilityActionResolver {

    public List<TraceabilityActionResponse> resolve(TraceabilityEventResponse event) {
        LinkedHashMap<String, TraceabilityActionResponse> actions = new LinkedHashMap<>();

        addAggregateAction(actions, event.aggregateType(), event.aggregateId());

        Map<String, Object> metadata = event.metadata();
        if (metadata == null || metadata.isEmpty()) {
            return List.copyOf(actions.values());
        }

        addMetadataAction(actions, metadata, "requestId", "Ver solicitud",
                TraceabilityResourceType.CUSTOMER_REQUEST);
        addMetadataAction(actions, metadata, "caseId", "Ver expediente",
                TraceabilityResourceType.JOB_CASE);
        addMetadataAction(actions, metadata, "quotationId", "Ver cotización",
                TraceabilityResourceType.QUOTATION);
        addMetadataAction(actions, metadata, "sourceQuotationId", "Ver cotización origen",
                TraceabilityResourceType.QUOTATION);
        addMetadataAction(actions, metadata, "nextQuotationId", "Ver nueva revisión",
                TraceabilityResourceType.QUOTATION);
        addMetadataAction(actions, metadata, "workOrderId", "Ver orden de trabajo",
                TraceabilityResourceType.WORK_ORDER);
        addMetadataAction(actions, metadata, "routingSheetId", "Ver hoja de ruta",
                TraceabilityResourceType.ROUTING_SHEET);
        addMetadataAction(actions, metadata, "operationId", "Ver operación",
                TraceabilityResourceType.ROUTING_OPERATION);
        addMetadataAction(actions, metadata, "executionId", "Ver ejecución",
                TraceabilityResourceType.OPERATION_EXECUTION);
        addMetadataAction(actions, metadata, "operationExecutionId", "Ver ejecución",
                TraceabilityResourceType.OPERATION_EXECUTION);
        addMetadataAction(actions, metadata, "documentId", "Ver documento",
                TraceabilityResourceType.DOCUMENT);

        Long previousVersionId = asLong(metadata.get("previousDocumentVersionId"));
        if (previousVersionId != null) {
            add(actions, "Ver versión anterior",
                    TraceabilityResourceType.DOCUMENT_VERSION, previousVersionId);
        }

        Long documentVersionId = asLong(metadata.get("documentVersionId"));
        if (documentVersionId != null) {
            add(actions,
                    previousVersionId == null ? "Ver versión" : "Ver versión nueva",
                    TraceabilityResourceType.DOCUMENT_VERSION,
                    documentVersionId);
        }

        addMetadataAction(actions, metadata, "evidenceDocumentVersionId", "Ver evidencia",
                TraceabilityResourceType.DOCUMENT_VERSION);
        addMetadataAction(actions, metadata, "materialLotId", "Ver lote",
                TraceabilityResourceType.MATERIAL_LOT);
        addMetadataAction(actions, metadata, "qualityInspectionId", "Ver inspección",
                TraceabilityResourceType.QUALITY_INSPECTION);
        addMetadataAction(actions, metadata, "measurementId", "Ver medición",
                TraceabilityResourceType.QUALITY_MEASUREMENT);
        addMetadataAction(actions, metadata, "nonConformityId", "Ver no conformidad",
                TraceabilityResourceType.NON_CONFORMITY);
        addMetadataAction(actions, metadata, "reworkNonConformityId", "Ver NC de retrabajo",
                TraceabilityResourceType.NON_CONFORMITY);
        addMetadataAction(actions, metadata, "deliveryId", "Ver entrega",
                TraceabilityResourceType.DELIVERY);

        return new ArrayList<>(actions.values());
    }

    private void addAggregateAction(
            LinkedHashMap<String, TraceabilityActionResponse> actions,
            TraceabilityAggregateType aggregateType,
            Long aggregateId
    ) {
        if (aggregateType == null || aggregateId == null) {
            return;
        }

        switch (aggregateType) {
            case CUSTOMER_REQUEST -> add(actions, "Ver solicitud",
                    TraceabilityResourceType.CUSTOMER_REQUEST, aggregateId);
            case JOB_CASE -> add(actions, "Ver expediente",
                    TraceabilityResourceType.JOB_CASE, aggregateId);
            case DOCUMENT -> add(actions, "Ver documento",
                    TraceabilityResourceType.DOCUMENT, aggregateId);
            case DOCUMENT_VERSION -> add(actions, "Ver versión",
                    TraceabilityResourceType.DOCUMENT_VERSION, aggregateId);
            case QUOTATION -> add(actions, "Ver cotización",
                    TraceabilityResourceType.QUOTATION, aggregateId);
            case WORK_ORDER -> add(actions, "Ver orden de trabajo",
                    TraceabilityResourceType.WORK_ORDER, aggregateId);
            case ROUTING_SHEET -> add(actions, "Ver hoja de ruta",
                    TraceabilityResourceType.ROUTING_SHEET, aggregateId);
            case OPERATION_EXECUTION -> add(actions, "Ver ejecución",
                    TraceabilityResourceType.OPERATION_EXECUTION, aggregateId);
            case QUALITY_INSPECTION -> add(actions, "Ver inspección",
                    TraceabilityResourceType.QUALITY_INSPECTION, aggregateId);
            case QUALITY_MEASUREMENT -> add(actions, "Ver medición",
                    TraceabilityResourceType.QUALITY_MEASUREMENT, aggregateId);
            case NON_CONFORMITY -> add(actions, "Ver no conformidad",
                    TraceabilityResourceType.NON_CONFORMITY, aggregateId);
            case DELIVERY -> add(actions, "Ver entrega",
                    TraceabilityResourceType.DELIVERY, aggregateId);
        }
    }

    private void addMetadataAction(
            LinkedHashMap<String, TraceabilityActionResponse> actions,
            Map<String, Object> metadata,
            String key,
            String label,
            TraceabilityResourceType resourceType
    ) {
        Long resourceId = asLong(metadata.get(key));
        if (resourceId != null) {
            add(actions, label, resourceType, resourceId);
        }
    }

    private void add(
            LinkedHashMap<String, TraceabilityActionResponse> actions,
            String label,
            TraceabilityResourceType resourceType,
            Long resourceId
    ) {
        if (resourceId == null) {
            return;
        }

        String key = resourceType.name() + ":" + resourceId;
        actions.putIfAbsent(
                key,
                new TraceabilityActionResponse(label, resourceType, resourceId)
        );
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String string && !string.isBlank()) {
            try {
                return Long.valueOf(string);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
