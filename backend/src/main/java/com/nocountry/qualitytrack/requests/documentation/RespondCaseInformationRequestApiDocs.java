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
        summary = "Responder solicitud de información",
        description = "Permite a un ADMIN o REQUESTER activo de la empresa responder una aclaración abierta. Al responder, el JobCase vuelve de WAITING_CUSTOMER_INFO a UNDER_REVIEW."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Información enviada correctamente"),
        @ApiResponse(responseCode = "400", description = "Respuesta inválida", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "Usuario no autorizado", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "Solicitud o aclaración no encontrada", content = @Content(schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "La aclaración ya fue respondida o el expediente no espera información", content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface RespondCaseInformationRequestApiDocs {
}
