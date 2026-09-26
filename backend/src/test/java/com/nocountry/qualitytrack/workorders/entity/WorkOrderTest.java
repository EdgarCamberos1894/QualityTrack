package com.nocountry.qualitytrack.workorders.entity;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class WorkOrderTest {

    @Test
    void planCreatesWorkOrderInPlanning() {
        WorkOrder workOrder = WorkOrder.plan(
                mock(JobCase.class),
                "WO-00000001",
                LocalDate.of(2026, 10, 15),
                mock(User.class)
        );

        assertEquals(WorkOrderStatus.PLANNING, workOrder.getStatus());
        assertEquals("WO-00000001", workOrder.getWorkOrderNumber());
        assertEquals(LocalDate.of(2026, 10, 15), workOrder.getAgreedDeliveryDate());
    }

    @Test
    void cancelMovesPlanningWorkOrderToCancelled() {
        User actor = mock(User.class);
        WorkOrder workOrder = WorkOrder.plan(
                mock(JobCase.class),
                "WO-00000001",
                LocalDate.of(2026, 10, 15),
                actor
        );
        Instant cancelledAt = Instant.parse("2026-09-26T18:00:00Z");

        workOrder.cancel(actor, "Capacidad de producción no disponible.", cancelledAt);

        assertEquals(WorkOrderStatus.CANCELLED, workOrder.getStatus());
        assertEquals("Capacidad de producción no disponible.", workOrder.getCancellationReason());
        assertEquals(cancelledAt, workOrder.getCancelledAt());
    }

    @Test
    void cancelledWorkOrderCannotBeCancelledAgain() {
        User actor = mock(User.class);
        WorkOrder workOrder = WorkOrder.plan(
                mock(JobCase.class),
                "WO-00000001",
                LocalDate.of(2026, 10, 15),
                actor
        );
        workOrder.cancel(actor, null, Instant.now());

        assertThrows(IllegalStateException.class, () -> workOrder.cancel(actor, null, Instant.now()));
    }
}
