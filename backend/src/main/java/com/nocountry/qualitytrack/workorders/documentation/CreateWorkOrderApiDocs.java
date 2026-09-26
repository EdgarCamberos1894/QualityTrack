package com.nocountry.qualitytrack.workorders.documentation;

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
        summary = "Crear orden de trabajo",
        description = "Crea la única WorkOrder 1:1 del JobCase. Requiere que el expediente esté READY_FOR_QUOTATION y tenga una cotización APPROVED. Solo ADMIN o PRODUCTION pueden crearla. La orden inicia en PLANNING, copia como fecha comprometida la estimatedDeliveryDate de la cotización aprobada y mueve el JobCase a IN_PRODUCTION. No duplica importes ni datos comerciales de la cotización."
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "Orden de trabajo creada correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite gestionar órdenes de trabajo", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe el expediente indicado", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "El expediente no está listo, no tiene una cotización aprobada o ya posee una orden de trabajo", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface CreateWorkOrderApiDocs {
}
