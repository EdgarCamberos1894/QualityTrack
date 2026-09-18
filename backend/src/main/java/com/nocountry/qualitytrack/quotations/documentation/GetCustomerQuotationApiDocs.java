package com.nocountry.qualitytrack.quotations.documentation;

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
        summary = "Consultar detalle de una cotización como cliente",
        description = "Devuelve una revisión enviada o histórica con sus conceptos, importes, vigencia y entrega estimada. Una revisión DRAFT no es visible para el cliente. customerStatus traduce el estado técnico al contexto del cliente; una revisión SUPERSEDED con una nueva DRAFT pendiente se presenta como ADJUSTMENT_REQUESTED y expone las notas del ajuste."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cotización consultada correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no pertenece a la empresa indicada", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "La cotización no existe, pertenece a otra empresa o todavía está en DRAFT", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface GetCustomerQuotationApiDocs {
}
