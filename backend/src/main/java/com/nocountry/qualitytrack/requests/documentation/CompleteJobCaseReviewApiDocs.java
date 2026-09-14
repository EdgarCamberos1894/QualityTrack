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
        summary = "Completar revisión del expediente",
        description = "Cambia el JobCase de UNDER_REVIEW a READY_FOR_QUOTATION. No permite completar si existe una aclaración pendiente o, cuando el cliente pidió asesoría de material, si aún no existe especificación técnica."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Expediente listo para cotización"),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "Usuario no autorizado", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "Expediente no encontrado", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La revisión aún no puede completarse", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface CompleteJobCaseReviewApiDocs {
}
