package com.nocountry.qualitytrack.quality.service;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.nonconformities.repository.NonConformityRepository;
import com.nocountry.qualitytrack.nonconformities.service.NonConformityReferenceGenerator;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quality.entity.QualityMeasurement;
import com.nocountry.qualitytrack.quality.enums.QualityInspectionStatus;
import com.nocountry.qualitytrack.quality.repository.QualityInspectionRepository;
import com.nocountry.qualitytrack.quality.repository.QualityMeasurementRepository;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import com.nocountry.qualitytrack.workorders.service.WorkOrderAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QualityWorkflowServiceTest {

    @Mock private WorkOrderAccessPolicy accessPolicy;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private QualityInspectionRepository inspectionRepository;
    @Mock private QualityMeasurementRepository measurementRepository;
    @Mock private NonConformityRepository nonConformityRepository;
    @Mock private NonConformityReferenceGenerator nonConformityReferenceGenerator;
    @Mock private TraceabilityService traceabilityService;
    @Mock private JobCase jobCase;
    @Mock private Quotation quotation;
    @Mock private User actor;

    private QualityWorkflowService service;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        service = new QualityWorkflowService(
                accessPolicy,
                workOrderRepository,
                inspectionRepository,
                measurementRepository,
                nonConformityRepository,
                nonConformityReferenceGenerator,
                traceabilityService
        );

        lenient().when(actor.getId()).thenReturn(10L);

        workOrder = WorkOrder.create(
                jobCase,
                quotation,
                "OT-00000001",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        ReflectionTestUtils.setField(workOrder, "id", 7L);
        workOrder.releaseToProduction();
        workOrder.startProduction(Instant.parse("2026-09-28T08:00:00Z"));
        workOrder.markProductionCompleted(Instant.parse("2026-09-28T16:00:00Z"));
    }

    @Test
    void handoffCreatesPendingInspectionAndMovesOrderToQualityPending() {
        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(inspectionRepository.saveAndFlush(any(QualityInspection.class)))
                .thenAnswer(invocation -> {
                    QualityInspection inspection = invocation.getArgument(0);
                    ReflectionTestUtils.setField(inspection, "id", 100L);
                    return inspection;
                });
        when(measurementRepository.findAllByQualityInspection_IdOrderByIdAsc(100L))
                .thenReturn(List.of());
        when(nonConformityRepository.findByQualityInspection_Id(100L))
                .thenReturn(Optional.empty());

        var response = service.handoff(10L, 7L);

        assertEquals(QualityInspectionStatus.PENDING, response.status());
        assertEquals(WorkOrderStatus.QUALITY_PENDING, workOrder.getStatus());
        assertEquals(100L, response.id());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void allPassingMeasurementsApproveInspectionAndOrder() {
        QualityInspection inspection = startedInspection();
        QualityMeasurement measurement = measurement(
                inspection,
                "25.020"
        );

        stubLockedInspection(inspection);
        when(accessPolicy.requireAssignedQualityActor(10L, 10L)).thenReturn(actor);
        when(measurementRepository.findAllByQualityInspection_IdOrderByIdAsc(100L))
                .thenReturn(List.of(measurement));
        when(inspectionRepository.saveAndFlush(inspection)).thenReturn(inspection);

        var response = service.complete(10L, 100L);

        assertEquals(QualityInspectionStatus.APPROVED, response.status());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
        assertNull(response.nonConformity());
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void failingMeasurementRejectsInspectionAndOpensNonConformity() {
        QualityInspection inspection = startedInspection();
        QualityMeasurement measurement = measurement(
                inspection,
                "25.080"
        );

        stubLockedInspection(inspection);
        when(accessPolicy.requireAssignedQualityActor(10L, 10L)).thenReturn(actor);
        when(measurementRepository.findAllByQualityInspection_IdOrderByIdAsc(100L))
                .thenReturn(List.of(measurement));
        when(nonConformityRepository.existsByQualityInspection_Id(100L)).thenReturn(false);
        when(nonConformityReferenceGenerator.nextNumber()).thenReturn("NC-0001");
        when(nonConformityRepository.saveAndFlush(any(NonConformity.class)))
                .thenAnswer(invocation -> {
                    NonConformity nonConformity = invocation.getArgument(0);
                    ReflectionTestUtils.setField(nonConformity, "id", 300L);
                    return nonConformity;
                });
        when(inspectionRepository.saveAndFlush(inspection)).thenReturn(inspection);

        var response = service.complete(10L, 100L);

        assertEquals(QualityInspectionStatus.REJECTED, response.status());
        assertEquals(WorkOrderStatus.QUALITY_HOLD, workOrder.getStatus());
        assertNotNull(response.nonConformity());
        assertEquals("NC-0001", response.nonConformity().number());
        assertEquals(NonConformityStatus.OPEN, response.nonConformity().status());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    private QualityInspection startedInspection() {
        QualityInspection inspection = QualityInspection.createPending(workOrder);
        ReflectionTestUtils.setField(inspection, "id", 100L);
        workOrder.sendToQuality();
        inspection.start(actor, Instant.parse("2026-09-28T17:00:00Z"));
        return inspection;
    }

    private QualityMeasurement measurement(
            QualityInspection inspection,
            String measuredValue
    ) {
        QualityMeasurement measurement = QualityMeasurement.create(
                inspection,
                "Diámetro exterior",
                new BigDecimal("25.000"),
                new BigDecimal("24.950"),
                new BigDecimal("25.050"),
                new BigDecimal(measuredValue),
                "mm",
                null
        );
        ReflectionTestUtils.setField(measurement, "id", 200L);
        return measurement;
    }

    private void stubLockedInspection(QualityInspection inspection) {
        when(inspectionRepository.findWorkOrderIdById(100L)).thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(inspectionRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(inspection));
    }
}
