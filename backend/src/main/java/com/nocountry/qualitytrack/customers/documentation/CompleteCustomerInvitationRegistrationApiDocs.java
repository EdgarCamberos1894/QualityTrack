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
        summary = "Completar registro desde una invitación",
        description = "Crea una cuenta CUSTOMER usando el correo de una invitación válida, verifica ese correo mediante el propio token de invitación y activa la membresía en la empresa."
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "Cuenta creada e invitación aceptada correctamente"),
        @ApiResponse(responseCode = "400", description = "Token inválido o datos de registro no válidos"),
        @ApiResponse(responseCode = "409", description = "Ya existe una cuenta asociada al correo invitado"),
        @ApiResponse(responseCode = "410", description = "La invitación ha expirado")
})
public @interface CompleteCustomerInvitationRegistrationApiDocs {
}
