package com.nocountry.qualitytrack.customers.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ProblemDetail;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Operation(
        summary = "Invitar miembro a una empresa",
        description = "Crea una invitación PENDING para el correo indicado y envía un enlace de aceptación. Solo un ADMIN activo de la empresa puede invitar. No se crea una membresía hasta que la invitación se acepta."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Invitación creada correctamente",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class), examples = @ExampleObject(value = CustomerApiExamples.CUSTOMER_INVITATION_CREATED))
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Los datos de la invitación no son válidos",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario no es ADMIN activo de la empresa",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "Empresa no encontrada",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.RESOURCE_NOT_FOUND))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "El usuario ya es miembro activo, existe otra invitación vigente o la cuenta destino no puede incorporarse",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.DATA_CONFLICT))
        ),
        @ApiResponse(
                responseCode = "503",
                description = "El servicio de correo no está disponible temporalmente",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = CustomerApiExamples.EMAIL_DELIVERY_FAILED))
        )
})
public @interface CreateCustomerInvitationApiDocs {
}
