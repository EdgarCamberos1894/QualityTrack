package com.nocountry.qualitytrack.customers.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@SecurityRequirements
@Operation(
        summary = "Consultar una invitación",
        description = "Valida un token de invitación y devuelve únicamente los datos necesarios para mostrar la pantalla de confirmación. No revela si el correo invitado ya tiene una cuenta y no consume la invitación."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Invitación disponible"),
        @ApiResponse(responseCode = "400", description = "Token de invitación inválido"),
        @ApiResponse(responseCode = "410", description = "La invitación ha expirado")
})
public @interface ResolveCustomerInvitationApiDocs {
}
