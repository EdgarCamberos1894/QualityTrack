package com.nocountry.qualitytrack.deliveries.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.deliveries.dto.request.ConfirmDeliveryReceptionRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CreateDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock private DeliveryAccessPolicy accessPolicy;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private JobCaseRepository jobCaseRepository;
    @Mock private DocumentVersionRepository documentVersionRepository;
    @Mock private TraceabilityService traceabilityService;
    @Mock private JobCase jobCase;
    @Mock private CustomerRequest customerRequest;
    @Mock private Customer customer;
    @Mock private Quotation quotation;
    @Mock private User logistics;
    @Mock private User customerUser;

    private DeliveryService service;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        service = new DeliveryService(
                accessPolicy,
                deliveryRepository,
                workOrderRepository,
                jobCaseRepository,
                documentVersionRepository,
                traceabilityService
        );

        lenient().when(logistics.getId()).thenReturn(10L);
        lenient().when(customerUser.getId()).thenReturn(20L);
        lenient().when(jobCase.getCustomerRequest()).thenReturn(customerRequest);
        lenient().when(customerRequest.getId()).thenReturn(30L);
        lenient().when(customerRequest.getCustomer()).thenReturn(customer);
        lenient().when(customer.getId()).thenReturn(40L);

        workOrder = readyForDeliveryOrder(20);
        ReflectionTestUtils.setField(workOrder, "id", 7L);
    }

    @Test
    void createsPartialDeliveryWhileReservedQuantityFitsPlan() {
        when(accessPolicy.requireLogisticsActor(10L)).thenReturn(logistics);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(deliveryRepository.sumReservedQuantityByWorkOrderId(7L, DeliveryStatus.CANCELLED))
                .thenReturn(8L);
        when(deliveryRepository.saveAndFlush(any(Delivery.class)))
                .thenAnswer(invocation -> {
                    Delivery delivery = invocation.getArgument(0);
                    ReflectionTestUtils.setField(delivery, "id", 100L);
                    return delivery;
                });

        var response = service.create(10L, 7L, createRequest(12));

        assertEquals(12, response.quantity());
        assertEquals(DeliveryStatus.PENDING, response.status());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void rejectsDeliveryWhenActiveReservationsWouldExceedPlan() {
        when(accessPolicy.requireLogisticsActor(10L)).thenReturn(logistics);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(deliveryRepository.sumReservedQuantityByWorkOrderId(7L, DeliveryStatus.CANCELLED))
                .thenReturn(15L);

        assertThrows(
                BusinessException.class,
                () -> service.create(10L, 7L, createRequest(6))
        );
    }

    @Test
    void partialConfirmedReceptionKeepsWorkOrderReadyForDelivery() {
        Delivery delivery = dispatchedDelivery(8);
        stubLockedDelivery(delivery);
        when(accessPolicy.requireCustomerReceiver(20L, 40L)).thenReturn(customerUser);
        when(deliveryRepository.saveAndFlush(delivery)).thenReturn(delivery);
        when(deliveryRepository.sumDeliveredQuantityByWorkOrderId(7L, DeliveryStatus.DELIVERED))
                .thenReturn(8L);

        var response = service.confirmReception(
                20L,
                40L,
                30L,
                100L,
                new ConfirmDeliveryReceptionRequest("Ana López", null)
        );

        assertEquals(DeliveryStatus.DELIVERED, response.status());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
    }

    @Test
    void finalConfirmedReceptionClosesWorkOrder() {
        Delivery delivery = dispatchedDelivery(12);
        stubLockedDelivery(delivery);
        when(accessPolicy.requireCustomerReceiver(20L, 40L)).thenReturn(customerUser);
        when(deliveryRepository.saveAndFlush(delivery)).thenReturn(delivery);
        when(deliveryRepository.sumDeliveredQuantityByWorkOrderId(7L, DeliveryStatus.DELIVERED))
                .thenReturn(20L);

        service.confirmReception(
                20L,
                40L,
                30L,
                100L,
                new ConfirmDeliveryReceptionRequest("Ana López", null)
        );

        assertEquals(WorkOrderStatus.DELIVERED, workOrder.getStatus());
        verify(workOrderRepository).saveAndFlush(workOrder);
    }

    private void stubLockedDelivery(Delivery delivery) {
        when(deliveryRepository.findWorkOrderIdById(100L)).thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(deliveryRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(delivery));
    }

    private Delivery dispatchedDelivery(int quantity) {
        Delivery delivery = Delivery.create(
                workOrder,
                quantity,
                "Cliente SA",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                "PAQUETERIA",
                logistics
        );
        ReflectionTestUtils.setField(delivery, "id", 100L);
        delivery.dispatch(
                logistics,
                "Transportes Demo",
                "GUIA-123",
                Instant.parse("2026-09-28T18:00:00Z")
        );
        return delivery;
    }

    private CreateDeliveryRequest createRequest(int quantity) {
        return new CreateDeliveryRequest(
                quantity,
                "Cliente SA",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                "PAQUETERIA"
        );
    }

    private WorkOrder readyForDeliveryOrder(int quantity) {
        WorkOrder order = WorkOrder.create(
                jobCase,
                quotation,
                "OT-DELIVERY-001",
                WorkOrderPriority.NORMAL,
                quantity,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                logistics
        );
        order.releaseToProduction();
        order.startProduction(Instant.parse("2026-09-28T08:00:00Z"));
        order.markProductionCompleted(Instant.parse("2026-09-28T16:00:00Z"));
        order.sendToQuality();
        order.approveQuality();
        return order;
    }
}
