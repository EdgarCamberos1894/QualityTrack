package com.nocountry.qualitytrack.customers.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcceptCustomerInvitationRequest(
        @NotBlank
        @Size(max = 512)
        String token
) {
}
