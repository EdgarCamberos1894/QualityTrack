package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.documents.dto.response.DocumentCenterResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.service.DocumentCenterService;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.materials.service.MaterialService;
import com.nocountry.qualitytrack.nonconformities.service.NonConformityService;
import com.nocountry.qualitytrack.production.service.ProductionWorkflowService;
import com.nocountry.qualitytrack.quality.service.QualityWorkflowService;
import com.nocountry.qualitytrack.quotations.service.QuotationService;
import com.nocountry.qualitytrack.routing.service.RoutingService;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityActionResponse;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityResourceType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityActionResolver;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderAgreementResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderSourceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkOrder360ServiceTest {

    @Mock private WorkOrderAccessPolicy accessPolicy;
    @Mock private WorkOrderService workOrderService;
    @Mock private QuotationService quotationService;
    @Mock private RoutingService routingService;
    @Mock private ProductionWorkflowService productionService;
    @Mock private MaterialService materialService;
    @Mock private QualityWorkflowService qualityService;
    @Mock private NonConformityService nonConformityService;
    @Mock private DocumentCenterService documentCenterService;
    @Mock private DocumentService documentService;
    @Mock private DeliveryService deliveryService;
    @Mock private TraceabilityService traceabilityService;
    @Mock private TraceabilityActionResolver actionResolver;

    @Mock private WorkOrderDetailResponse workOrder;
    @Mock private WorkOrderSourceResponse source;
    @Mock private WorkOrderAgreementResponse agreement;
    @Mock private DocumentCenterResponse document;
    @Mock private DocumentVersionResponse documentVersion;

    private WorkOrder360Service service;

    @BeforeEach
    void setUp() {
        service = new WorkOrder360Service(
                accessPolicy,
                workOrderService,
                quotationService,
                routingService,
                productionService,
                materialService,
                qualityService,
                nonConformityService,
                documentCenterService,
                documentService,
                deliveryService,
                traceabilityService,
                actionResolver
        );
    }

    @Test
    void composesWorkOrderHistoryWithoutDuplicatingDomainData() {
        when(workOrderService.get(10L, 7L)).thenReturn(workOrder);
        when(workOrder.source()).thenReturn(source);
        when(workOrder.agreement()).thenReturn(agreement);
        when(source.caseId()).thenReturn(12L);
        when(agreement.quotationId()).thenReturn(20L);

        when(documentCenterService.search(
                10L,
                null,
                null,
                7L,
                null,
                null,
                null,
                null
        )).thenReturn(List.of(document));
        when(document.caseId()).thenReturn(12L);
        when(document.id()).thenReturn(30L);
        when(documentService.listVersions(10L, 12L, 30L))
                .thenReturn(List.of(documentVersion));

        TraceabilityEventResponse event = new TraceabilityEventResponse(
                100L,
                TraceabilityAggregateType.DOCUMENT_VERSION,
                31L,
                TraceabilityEventType.DOCUMENT_VERSION_ADDED,
                null,
                null,
                10L,
                "Ana López",
                Map.of("documentId", 30L),
                Instant.parse("2026-09-28T18:00:00Z")
        );
        TraceabilityActionResponse action = new TraceabilityActionResponse(
                "Ver versión",
                TraceabilityResourceType.DOCUMENT_VERSION,
                31L
        );

        when(traceabilityService.timeline(12L)).thenReturn(List.of(event));
        when(actionResolver.resolve(event)).thenReturn(List.of(action));

        when(quotationService.listRevisionsInternal(10L, 20L)).thenReturn(List.of());
        when(routingService.list(10L, 7L)).thenReturn(List.of());
        when(materialService.listConsumption(10L, 7L)).thenReturn(List.of());
        when(qualityService.list(10L, 7L)).thenReturn(List.of());
        when(nonConformityService.listByWorkOrder(10L, 7L)).thenReturn(List.of());
        when(deliveryService.listByWorkOrder(10L, 7L)).thenReturn(List.of());

        var response = service.get(10L, 7L);

        assertSame(workOrder, response.workOrder());
        assertEquals(1, response.documents().size());
        assertSame(document, response.documents().get(0).document());
        assertEquals(1, response.documents().get(0).versions().size());
        assertSame(documentVersion, response.documents().get(0).versions().get(0));
        assertEquals(1, response.timeline().size());
        assertEquals(1, response.timeline().get(0).actions().size());
        assertEquals(31L, response.timeline().get(0).actions().get(0).resourceId());

        verify(accessPolicy).requireInternalReader(10L);
        verify(productionService).getStatus(10L, 7L);
    }
}
