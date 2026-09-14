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
        summary = "Tomar expediente e iniciar revisión",
        description = "Asigna al usuario COMMERCIAL autenticado como responsable de un JobCase SUBMITTED y cambia el estado a UNDER_REVIEW en la misma operación. ADMIN también puede ejecutar la acción."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Expediente tomado y revisión iniciada correctamente"),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "Rol no autorizado", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "Expediente no encontrado", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "El expediente ya está asignado o no puede tomarse en su estado actual", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface TakeJobCaseApiDocs {
}
