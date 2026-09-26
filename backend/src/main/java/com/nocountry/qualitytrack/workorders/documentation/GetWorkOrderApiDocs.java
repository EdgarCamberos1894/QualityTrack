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
        summary = "Consultar detalle de una orden de trabajo",
        description = "Devuelve la orden junto con el contexto operativo del expediente: solicitud, cantidad, material, especificación técnica, documentos e información complementaria. También identifica la cotización aprobada y la fecha comprometida, sin exponer precios, impuestos ni totales comerciales."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Orden de trabajo consultada correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El rol interno no permite consultar órdenes de trabajo", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No existe la orden de trabajo indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "No se puede resolver la cotización aprobada asociada al expediente", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface GetWorkOrderApiDocs {
}
