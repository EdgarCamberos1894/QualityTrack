package com.nocountry.qualitytrack.customers.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.http.ProblemDetail;

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
        description = "Procesa una invitación mediante su token. Si el correo ya pertenece a una cuenta CUSTOMER disponible, crea o reactiva la membresía ACTIVE y consume la invitación. Si aún no existe una cuenta, devuelve REGISTRATION_REQUIRED y mantiene la invitación PENDING para completar el registro. No requiere JWT."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Invitación aceptada o registro requerido",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = {
                                @ExampleObject(name = "Cuenta existente", value = CustomerApiExamples.CUSTOMER_INVITATION_ACCEPTED),
                                @ExampleObject(name = "Registro requerido", value = CustomerApiExamples.CUSTOMER_INVITATION_REGISTRATION_REQUIRED)
                        }
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Token de invitación inválido o ya consumido",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.INVALID_CUSTOMER_INVITATION_TOKEN))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "La cuenta o membresía asociada no permite completar la aceptación",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.DATA_CONFLICT))
        ),
        @ApiResponse(
                responseCode = "410",
                description = "La invitación ha expirado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_INVITATION_EXPIRED))
        )
})
public @interface AcceptCustomerInvitationApiDocs {
}
