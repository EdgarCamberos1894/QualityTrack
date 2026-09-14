package com.nocountry.qualitytrack.requests.documentation;

import com.nocountry.qualitytrack.requests.dto.request.CreateCaseInformationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
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
        summary = "Solicitar una aclaración al cliente",
        description = "Se utiliza cuando el responsable del expediente ya está revisando la solicitud pero necesita un dato adicional del cliente antes de continuar. El JobCase debe estar en UNDER_REVIEW. La operación crea una CaseInformationRequest con la pregunta enviada y cambia el expediente a WAITING_CUSTOMER_INFO para reflejar que la revisión queda pausada esperando al cliente. Solo puede existir una solicitud de información abierta por expediente. Puede ejecutarla el COMMERCIAL responsable del caso o un ADMIN. La respuesta del cliente se registra mediante el endpoint contextual de la CustomerRequest; el usuario interno no debe cambiar manualmente el estado para reanudar la revisión.",
        requestBody = @RequestBody(
                required = true,
                description = "Pregunta concreta que el equipo interno necesita que responda el cliente.",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = CreateCaseInformationRequest.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.CREATE_INFORMATION_REQUEST)
                )
        )
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Se creó la solicitud de información y el expediente pasó a WAITING_CUSTOMER_INFO",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.INFORMATION_REQUEST_CREATED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "La pregunta está vacía o supera el máximo permitido",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario no es el COMMERCIAL responsable del expediente ni un ADMIN autorizado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "No existe un expediente con el identificador indicado",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "El expediente no está en UNDER_REVIEW o ya existe otra solicitud de información pendiente",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = JobCaseApiExamples.DATA_CONFLICT))
        )
})
public @interface RequestJobCaseInformationApiDocs {
}
