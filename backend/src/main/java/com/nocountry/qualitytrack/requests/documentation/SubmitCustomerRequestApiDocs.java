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
        summary = "Enviar solicitud de cliente",
        description = "Envía una nueva solicitud como multipart/form-data. La parte 'request' contiene los datos JSON de la solicitud y la parte opcional 'documents' permite adjuntar uno o varios archivos iniciales. El backend crea CustomerRequest y su JobCase 1:1 y, una vez disponible el identificador del expediente, crea los documentos asociados al mismo JobCase dentro de la misma transacción de aplicación. Si falla la creación de cualquiera de los documentos, la transacción de base de datos se revierte y el adaptador de almacenamiento intenta compensar eliminando los archivos ya almacenados. Requiere membresía ACTIVE con rol ADMIN o REQUESTER."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Solicitud, expediente y documentos iniciales creados correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = RequestApiExamples.CUSTOMER_REQUEST_SUBMITTED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Los datos de la solicitud o alguno de los archivos no son válidos",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "Autenticación requerida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "Sin membresía activa, rol suficiente o empresa disponible para recibir solicitudes",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "413",
                description = "Uno de los archivos o la petición multipart supera el límite configurado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
                responseCode = "503",
                description = "El almacenamiento de documentos no está disponible",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
})
public @interface SubmitCustomerRequestApiDocs {
}
