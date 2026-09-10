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
        summary = "Aceptar una invitación",
        description = "Procesa una invitación mediante su token. Si el correo ya pertenece a una cuenta CUSTOMER disponible, activa la membresía y consume la invitación. Si aún no existe una cuenta, conserva la invitación pendiente e indica que debe completarse el registro."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Invitación aceptada o registro requerido"),
        @ApiResponse(responseCode = "400", description = "Token de invitación inválido"),
        @ApiResponse(responseCode = "409", description = "La cuenta o membresía asociada no permite completar la aceptación"),
        @ApiResponse(responseCode = "410", description = "La invitación ha expirado")
})
public @interface AcceptCustomerInvitationApiDocs {
}
