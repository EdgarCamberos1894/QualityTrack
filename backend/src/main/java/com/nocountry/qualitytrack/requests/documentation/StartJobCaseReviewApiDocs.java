package com.nocountry.qualitytrack.requests.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
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
        summary = "Iniciar revisión del expediente",
        description = "Cambia el JobCase de SUBMITTED a UNDER_REVIEW. Requiere un responsable asignado y solo puede ejecutarlo ese COMMERCIAL o un ADMIN."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Revisión iniciada correctamente"),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "Usuario no autorizado", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "Expediente no encontrado", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "Transición de estado no permitida", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface StartJobCaseReviewApiDocs {
}
