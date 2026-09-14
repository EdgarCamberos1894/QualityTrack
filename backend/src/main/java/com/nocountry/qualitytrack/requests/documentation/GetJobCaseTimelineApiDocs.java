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
        summary = "Consultar historial del expediente",
        description = "Devuelve, en orden cronológico, los eventos de negocio registrados para un JobCase. Esta consulta sirve para reconstruir qué ocurrió durante el ciclo del expediente sin depender únicamente de su estado actual. Entre otros hechos pueden aparecer la creación de la solicitud y del expediente, el inicio de la revisión al ser tomado por un responsable, solicitudes y respuestas de información, definición técnica de material, cambios relacionados con documentos, cancelación y preparación para cotización. La trazabilidad es append-only y de solo lectura desde este endpoint; los eventos se generan automáticamente como consecuencia de otras operaciones del sistema. Pueden consultarla cuentas INTERNAL con rol ADMIN, COMMERCIAL, ENGINEERING o AUDITOR."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Historial cronológico del expediente consultado correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class)
                )
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED)
                )
        ),
        @ApiResponse(
                responseCode = "403",
                description = "La cuenta no es INTERNAL o no posee un rol con acceso al historial del expediente",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED)
                )
        ),
        @ApiResponse(
                responseCode = "404",
                description = "No existe un expediente con el identificador indicado",
                content = @Content(
                        mediaType = "application/problem+json",
                        schema = @Schema(implementation = ProblemDetail.class),
                        examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND)
                )
        )
})
public @interface GetJobCaseTimelineApiDocs {
}
