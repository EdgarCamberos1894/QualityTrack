package com.nocountry.qualitytrack.customers.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.customers.documentation.CustomerInvitationApiDocs;
import com.nocountry.qualitytrack.customers.dto.request.AcceptCustomerInvitationRequest;
import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerInvitationRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerInvitationResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerMemberResponse;
import com.nocountry.qualitytrack.customers.service.CustomerInvitationService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CustomerInvitationApiDocs
public class CustomerInvitationController {

    private final CustomerInvitationService invitationService;

    @PostMapping("/customers/{customerId}/invitations")
    public ResponseEntity<ApiResponse<CustomerInvitationResponse>> createInvitation(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @Valid @RequestBody CreateCustomerInvitationRequest request
    ) {
        CustomerInvitationResponse response = invitationService.createInvitation(
                currentUserId,
                customerId,
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.CUSTOMER_INVITATION_CREATED,
                        "Invitación enviada correctamente.",
                        response
                ));
    }

    @PostMapping("/customer-invitations/accept")
    public ResponseEntity<ApiResponse<CustomerMemberResponse>> acceptInvitation(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody AcceptCustomerInvitationRequest request
    ) {
        CustomerMemberResponse response = invitationService.acceptInvitation(currentUserId, request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_INVITATION_ACCEPTED,
                "Invitación aceptada correctamente.",
                response
        ));
    }
}
