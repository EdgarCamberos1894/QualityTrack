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
        summary = "Consultar detalle de una solicitud de cliente",
        description = "Devuelve una CustomerRequest junto con su JobCase, documentos activos y aclaraciones asociadas. De cada documento se incluye su versión actual; la consulta no modifica estados."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Solicitud consultada correctamente con expediente, documentos y aclaraciones asociadas",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = RequestApiExamples.CUSTOMER_REQUEST_RETRIEVED)
                )
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario no posee una membresía ACTIVE en la empresa o no puede consultar sus documentos",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "La solicitud no existe dentro de la empresa indicada",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND))
        )
})
public @interface GetCustomerRequestApiDocs {
}
