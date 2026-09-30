package com.nocountry.qualitytrack.documents.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.documents.dto.response.CustomerDocumentCenterResponse;
import com.nocountry.qualitytrack.documents.service.CustomerDocumentCenterService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/{customerId}/documents")
@RequiredArgsConstructor
@Validated
public class CustomerDocumentCenterController {

    private final CustomerDocumentCenterService customerDocumentCenterService;

    @Operation(summary = "Consultar documentos visibles para la empresa cliente")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDocumentCenterResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable @Positive Long customerId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENTS_RETRIEVED,
                "Documentos del portal consultados correctamente.",
                customerDocumentCenterService.list(currentUserId, customerId)
        ));
    }
}
