package com.nocountry.qualitytrack.customers.controller;

import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.request.UpdateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerMemberResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerResponse;
import com.nocountry.qualitytrack.customers.service.CustomerService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Empresas cliente", description = "Gestión de empresas cliente y sus membresías.")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateCustomerRequest request
    ) {
        CustomerResponse response = customerService.createCustomer(currentUserId(jwt), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.CUSTOMER_CREATED,
                        "Empresa creada correctamente.",
                        response
                ));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long customerId
    ) {
        CustomerResponse response = customerService.getCustomer(currentUserId(jwt), customerId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_RETRIEVED,
                "Empresa consultada correctamente.",
                response
        ));
    }

    @PatchMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long customerId,
            @Valid @RequestBody UpdateCustomerRequest request
    ) {
        CustomerResponse response = customerService.updateCustomer(currentUserId(jwt), customerId, request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_UPDATED,
                "Empresa actualizada correctamente.",
                response
        ));
    }

    @GetMapping("/{customerId}/members")
    public ResponseEntity<ApiResponse<List<CustomerMemberResponse>>> listMembers(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long customerId
    ) {
        List<CustomerMemberResponse> response = customerService.listMembers(currentUserId(jwt), customerId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_MEMBERS_RETRIEVED,
                "Miembros de la empresa consultados correctamente.",
                response
        ));
    }

    @DeleteMapping("/{customerId}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long customerId,
            @PathVariable Long userId
    ) {
        customerService.removeMember(currentUserId(jwt), customerId, userId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_MEMBER_REMOVED,
                "Miembro retirado de la empresa correctamente.",
                null
        ));
    }

    private Long currentUserId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
