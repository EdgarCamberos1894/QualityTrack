package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.documents.dto.response.DocumentCenterResponse;
import com.nocountry.qualitytrack.documents.service.DocumentCenterService;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.materials.service.MaterialService;
import com.nocountry.qualitytrack.nonconformities.service.NonConformityService;
import com.nocountry.qualitytrack.production.service.ProductionWorkflowService;
import com.nocountry.qualitytrack.quality.service.QualityWorkflowService;
import com.nocountry.qualitytrack.quotations.service.QuotationService;
import com.nocountry.qualitytrack.routing.service.RoutingService;
import com.nocountry.qualitytrack.traceability.dto.response.Traceability360EventResponse;
import com.nocountry.qualitytrack.traceability.service.TraceabilityActionResolver;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrder360DocumentResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrder360Response;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrder360Service {

    private final WorkOrderAccessPolicy accessPolicy;
    private final WorkOrderService workOrderService;
    private final QuotationService quotationService;
    private final RoutingService routingService;
    private final ProductionWorkflowService productionService;
    private final MaterialService materialService;
    private final QualityWorkflowService qualityService;
    private final NonConformityService nonConformityService;
    private final DocumentCenterService documentCenterService;
    private final DocumentService documentService;
    private final DeliveryService deliveryService;
    private final TraceabilityService traceabilityService;
    private final TraceabilityActionResolver actionResolver;

    @Transactional(readOnly = true)
    public WorkOrder360Response get(Long currentUserId, Long workOrderId) {
        accessPolicy.requireInternalReader(currentUserId);

        WorkOrderDetailResponse workOrder = workOrderService.get(
                currentUserId,
                workOrderId
        );

        Long caseId = workOrder.source().caseId();
        Long quotationId = workOrder.agreement().quotationId();

        List<DocumentCenterResponse> centerDocuments = documentCenterService.search(
                currentUserId,
                null,
                null,
                workOrderId,
                null,
                null,
                null,
                null
        );

        List<WorkOrder360DocumentResponse> documents = centerDocuments.stream()
                .map(document -> new WorkOrder360DocumentResponse(
                        document,
                        documentService.listVersions(
                                currentUserId,
                                document.caseId(),
                                document.id()
                        )
                ))
                .toList();

        List<Traceability360EventResponse> timeline = traceabilityService
                .timeline(caseId)
                .stream()
                .map(event -> Traceability360EventResponse.from(
                        event,
                        actionResolver.resolve(event)
                ))
                .toList();

        return new WorkOrder360Response(
                workOrder,
                quotationService.listRevisionsInternal(
                        currentUserId,
                        quotationId
                ),
                routingService.list(currentUserId, workOrderId),
                productionService.getStatus(currentUserId, workOrderId),
                materialService.listConsumption(currentUserId, workOrderId),
                qualityService.list(currentUserId, workOrderId),
                nonConformityService.listByWorkOrder(currentUserId, workOrderId),
                documents,
                deliveryService.listByWorkOrder(currentUserId, workOrderId),
                timeline
        );
    }
}
