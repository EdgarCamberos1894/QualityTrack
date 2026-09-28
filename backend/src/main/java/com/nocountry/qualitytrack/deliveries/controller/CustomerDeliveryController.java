package com.nocountry.qualitytrack.deliveries.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.deliveries.documentation.DeliveryApiDocs;
import com.nocountry.qualitytrack.deliveries.dto.request.ConfirmDeliveryReceptionRequest;
import com.nocountry.qualitytrack.deliveries.dto.response.DeliveryResponse;
import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
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
@RequestMapping("/api/v1/customers/{customerId}/requests/{requestId}/deliveries")
@RequiredArgsConstructor
@DeliveryApiDocs
public class CustomerDeliveryController {

    private final DeliveryService deliveryService;

    @Operation(summary = "Consultar los envíos asociados a una solicitud")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERIES_RETRIEVED,
                "Envíos consultados correctamente.",
                deliveryService.listForCustomerRequest(currentUserId, customerId, requestId)
        ));
    }

    @Operation(summary = "Confirmar la recepción real de una entrega despachada")
    @PostMapping("/{deliveryId}/confirm-reception")
    public ResponseEntity<ApiResponse<DeliveryResponse>> confirmReception(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @PathVariable Long deliveryId,
            @Valid @RequestBody ConfirmDeliveryReceptionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERY_DELIVERED,
                "Recepción confirmada correctamente.",
                deliveryService.confirmReception(
                        currentUserId,
                        customerId,
                        requestId,
                        deliveryId,
                        request
                )
        ));
    }
}
