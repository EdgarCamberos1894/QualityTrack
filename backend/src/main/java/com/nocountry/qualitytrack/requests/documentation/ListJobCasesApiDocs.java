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
        summary = "Consultar bandeja de expedientes",
        description = "Devuelve todos los JobCase visibles para el trabajo interno, ordenados desde el más reciente. Cada elemento incluye el estado actual, el responsable cuando exista y un resumen de la CustomerRequest que originó el expediente. SUBMITTED sin responsable representa un expediente todavía sin asignar; UNDER_REVIEW indica que un responsable ya lo tomó y lo está revisando; WAITING_CUSTOMER_INFO indica que la revisión está pausada esperando una respuesta del cliente; READY_FOR_QUOTATION indica que la revisión terminó y el siguiente paso de negocio es crear una cotización. Esta consulta no asigna expedientes ni modifica estados. Pueden utilizarla cuentas INTERNAL con rol ADMIN, COMMERCIAL, ENGINEERING o AUDITOR."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Bandeja de expedientes consultada correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = RequestApiExamples.JOB_CASES_RETRIEVED)
                )
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "La cuenta no es INTERNAL o no posee un rol con acceso a la bandeja de expedientes",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        )
})
public @interface ListJobCasesApiDocs {
}
