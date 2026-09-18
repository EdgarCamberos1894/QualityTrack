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
        summary = "Consultar cotizaciones de la empresa",
        description = "Lista únicamente la revisión más reciente de cada flujo que ya es visible para el cliente. Las revisiones DRAFT permanecen internas; si existe una nueva DRAFT por una solicitud de ajuste, el cliente continúa viendo la última revisión no DRAFT hasta que la nueva revisión sea enviada. Cualquier miembro ACTIVE de la empresa puede consultar la bandeja."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Cotizaciones de la empresa consultadas correctamente"),
        @ApiResponse(responseCode = "401", description = "La petición no contiene una autenticación válida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no es miembro ACTIVE de la empresa", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface ListCustomerQuotationsApiDocs {
}
