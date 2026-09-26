package com.nocountry.qualitytrack.workorders.dto.response;

import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;

import java.time.Instant;
import java.time.LocalDate;

public record WorkOrderResponse(
        Long id,
        Long caseId,
        String caseNumber,
        Long requestId,
        String requestNumber,
        Long customerId,
        String customerName,
        String workOrderNumber,
        WorkOrderStatus status,
        Integer requestedQuantity,
        LocalDate agreedDeliveryDate,
        Long createdByUserId,
        String createdByName,
        Instant cancelledAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static WorkOrderResponse from(WorkOrder workOrder) {
        CustomerRequest request = workOrder.getJobCase().getCustomerRequest();

        return new WorkOrderResponse(
                workOrder.getId(),
                workOrder.getJobCase().getId(),
                workOrder.getJobCase().getCaseNumber(),
                request.getId(),
                request.getRequestNumber(),
                request.getCustomer().getId(),
                request.getCustomer().getName(),
                workOrder.getWorkOrderNumber(),
                workOrder.getStatus(),
                request.getQuantity(),
                workOrder.getAgreedDeliveryDate(),
                workOrder.getCreatedByUser().getId(),
                fullName(workOrder.getCreatedByUser()),
                workOrder.getCancelledAt(),
                workOrder.getCreatedAt(),
                workOrder.getUpdatedAt()
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
