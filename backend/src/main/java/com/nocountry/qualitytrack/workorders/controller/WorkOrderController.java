package com.nocountry.qualitytrack.workorders.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import com.nocountry.qualitytrack.workorders.documentation.WorkOrderApiDocs;
import com.nocountry.qualitytrack.workorders.dto.request.CancelWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderResponse;
import com.nocountry.qualitytrack.workorders.service.WorkOrderService;
import com.nocountry.qualitytrack.workorders.service.WorkOrderWorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
@WorkOrderApiDocs
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final WorkOrderWorkflowService workflowService;

    @Operation(summary = "Listar órdenes de trabajo")
    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkOrderResponse>>> list(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDERS_RETRIEVED,
                "Órdenes de trabajo consultadas correctamente.",
                workOrderService.list(currentUserId)
        ));
    }

    @Operation(summary = "Consultar detalle de una orden de trabajo")
    @GetMapping("/{workOrderId}")
    public ResponseEntity<ApiResponse<WorkOrderDetailResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_RETRIEVED,
                "Orden de trabajo consultada correctamente.",
                workOrderService.get(currentUserId, workOrderId)
        ));
    }

    @Operation(
            summary = "Cancelar una orden de trabajo",
            description = "Cancela una orden que aún se encuentra en planificación y cierra el expediente."
    )
    @PostMapping("/{workOrderId}/cancel")
    public ResponseEntity<ApiResponse<WorkOrderDetailResponse>> cancel(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId,
            @Valid @RequestBody(required = false) CancelWorkOrderRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_CANCELLED,
                "Orden de trabajo cancelada correctamente.",
                workflowService.cancel(currentUserId, workOrderId, request)
        ));
    }
}
