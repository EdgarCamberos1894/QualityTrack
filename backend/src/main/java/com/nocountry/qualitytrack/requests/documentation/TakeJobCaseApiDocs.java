package com.nocountry.qualitytrack.requests.documentation;

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
        summary = "Tomar expediente e iniciar su revisión",
        description = "Permite que un usuario INTERNAL con rol COMMERCIAL tome un expediente que todavía no está siendo atendido. El JobCase debe estar en SUBMITTED y no tener responsable asignado. La operación asigna al usuario autenticado como responsable, registra assignedAt y cambia el estado directamente de SUBMITTED a UNDER_REVIEW; no existe un paso adicional para iniciar la revisión. ADMIN también puede ejecutar la operación. Si otro usuario ya tomó el expediente o el caso ya avanzó a otro estado, se responde con 409 Conflict. Tomar el expediente no crea una cotización ni modifica la solicitud original del cliente."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "El usuario quedó asignado como responsable y el expediente pasó a UNDER_REVIEW",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.JOB_CASE_REVIEW_STARTED)
                )
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "La cuenta no es INTERNAL o no posee rol COMMERCIAL/ADMIN para tomar expedientes",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "No existe un expediente con el identificador indicado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "El expediente ya tiene responsable o ya no está en SUBMITTED",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = JobCaseApiExamples.DATA_CONFLICT))
        )
})
public @interface TakeJobCaseApiDocs {
}
