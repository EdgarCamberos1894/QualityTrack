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
        description = "Finaliza una invitación que devolvió REGISTRATION_REQUIRED. Crea una cuenta CUSTOMER con el correo fijado por la invitación, usa el propio token como prueba de control del correo y activa la membresía en la misma transacción."
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "Cuenta creada e invitación aceptada correctamente"),
        @ApiResponse(responseCode = "400", description = "Token inválido o datos de registro no válidos"),
        @ApiResponse(responseCode = "409", description = "Ya existe una cuenta asociada al correo invitado"),
        @ApiResponse(responseCode = "410", description = "La invitación ha expirado")
})
public @interface CompleteCustomerInvitationRegistrationApiDocs {
}
