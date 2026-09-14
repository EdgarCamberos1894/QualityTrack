package com.nocountry.qualitytrack.requests.documentation;

import com.nocountry.qualitytrack.requests.dto.request.RespondCaseInformationRequest;
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
        summary = "Responder una aclaración solicitada por el equipo interno",
        description = "Permite que el cliente responda una CaseInformationRequest abierta perteneciente a su propia CustomerRequest. Puede hacerlo un miembro ACTIVE de la empresa con rol ADMIN o REQUESTER. El expediente debe encontrarse en WAITING_CUSTOMER_INFO y la aclaración indicada debe seguir abierta. La operación guarda la respuesta, registra quién respondió y cuándo, cierra esa solicitud de información y devuelve automáticamente el JobCase a UNDER_REVIEW para que el responsable interno pueda continuar. El cliente no elige ni envía el nuevo estado del expediente; esa transición la controla el backend.",
        requestBody = @RequestBody(
                required = true,
                description = "Respuesta del cliente a la pregunta concreta realizada por el equipo interno.",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = RespondCaseInformationRequest.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.RESPOND_INFORMATION_REQUEST)
                )
        )
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "La aclaración quedó respondida y el expediente volvió a UNDER_REVIEW",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.INFORMATION_REQUEST_RESPONDED)
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "La respuesta está vacía o supera el máximo permitido",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.VALIDATION_ERROR))
        ),
        @ApiResponse(
                responseCode = "401",
                description = "La petición no contiene una autenticación válida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.AUTHENTICATION_REQUIRED))
        ),
        @ApiResponse(
                responseCode = "403",
                description = "El usuario no posee una membresía ACTIVE con rol ADMIN/REQUESTER en la empresa indicada",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.ACCESS_DENIED))
        ),
        @ApiResponse(
                responseCode = "404",
                description = "La CustomerRequest no pertenece a la empresa indicada o la solicitud de información no pertenece a ese expediente",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = RequestApiExamples.RESOURCE_NOT_FOUND))
        ),
        @ApiResponse(
                responseCode = "409",
                description = "El expediente ya no está esperando información o la aclaración indicada ya fue respondida",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = JobCaseApiExamples.DATA_CONFLICT))
        )
})
public @interface RespondCaseInformationRequestApiDocs {
}
