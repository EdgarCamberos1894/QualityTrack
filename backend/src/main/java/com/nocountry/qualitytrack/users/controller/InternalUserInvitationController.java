package com.nocountry.qualitytrack.users.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import com.nocountry.qualitytrack.users.dto.request.CompleteInternalUserInvitationRequest;
import com.nocountry.qualitytrack.users.dto.request.CreateInternalUserInvitationRequest;
import com.nocountry.qualitytrack.users.dto.request.InternalUserInvitationTokenRequest;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationAcceptResponse;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationPreviewResponse;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationResponse;
import com.nocountry.qualitytrack.users.service.InternalUserInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(
        name = "04 · Usuarios internos",
        description = "Incorporación segura de usuarios internos y asignación inicial de roles."
)
public class InternalUserInvitationController {

    private final InternalUserInvitationService invitationService;

    @Operation(
            summary = "Invitar usuario interno",
            description = "Permite a un ADMIN interno activo provisionar una cuenta pendiente, asignar uno o varios roles y enviar un enlace de activación de un solo uso."
    )
    @PostMapping("/internal/invitations")
    public ResponseEntity<ApiResponse<InternalUserInvitationResponse>> createInvitation(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody CreateInternalUserInvitationRequest request
    ) {
        InternalUserInvitationResponse response = invitationService.createInvitation(currentUserId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.INTERNAL_INVITATION_CREATED,
                        "Invitación interna enviada correctamente.",
                        response
                ));
    }

    @Operation(
            summary = "Resolver invitación interna",
            description = "Valida el token y devuelve los datos y roles de la cuenta pendiente antes de establecer la contraseña."
    )
    @PostMapping("/internal-invitations/resolve")
    public ResponseEntity<ApiResponse<InternalUserInvitationPreviewResponse>> resolveInvitation(
            @Valid @RequestBody InternalUserInvitationTokenRequest request
    ) {
        InternalUserInvitationPreviewResponse response = invitationService.resolveInvitation(request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_INVITATION_RESOLVED,
                "Invitación interna disponible.",
                response
        ));
    }

    @Operation(
            summary = "Aceptar invitación interna",
            description = "Consume la invitación, establece la contraseña elegida por el usuario y activa la cuenta interna con los roles previamente asignados por el administrador."
    )
    @PostMapping("/internal-invitations/accept")
    public ResponseEntity<ApiResponse<InternalUserInvitationAcceptResponse>> acceptInvitation(
            @Valid @RequestBody CompleteInternalUserInvitationRequest request
    ) {
        InternalUserInvitationAcceptResponse response = invitationService.acceptInvitation(request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_INVITATION_ACCEPTED,
                "Cuenta interna activada correctamente. Ya puedes iniciar sesión.",
                response
        ));
    }
}
