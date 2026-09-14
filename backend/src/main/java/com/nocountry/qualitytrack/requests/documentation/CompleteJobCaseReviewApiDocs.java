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
        summary = "Completar la revisión y dejar el expediente listo para cotizar",
        description = "Finaliza la etapa de revisión interna del JobCase. Solo puede ejecutarse cuando el expediente está en UNDER_REVIEW y por el COMMERCIAL responsable del caso o un ADMIN. Antes de permitir la transición, el backend valida que no exista ninguna CaseInformationRequest abierta esperando respuesta del cliente. Además, si la CustomerRequest fue creada con materialRequirementType = ASSISTANCE_REQUIRED, debe existir una CaseMaterialSpecification definida por Ingeniería. Si todas las condiciones se cumplen, el estado cambia de UNDER_REVIEW a READY_FOR_QUOTATION. Esta operación únicamente declara que la información necesaria para cotizar está completa: no crea una Quotation automáticamente. La cotización será un recurso posterior y separado."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "La revisión terminó y el expediente pasó a READY_FOR_QUOTATION",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = JobCaseApiExamples.JOB_CASE_READY_FOR_QUOTATION)
                )
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
                description = "El expediente no está en UNDER_REVIEW, existe una aclaración abierta o falta definir el material requerido para una solicitud con ASSISTANCE_REQUIRED",
                content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class), examples = @ExampleObject(value = JobCaseApiExamples.DATA_CONFLICT))
        )
})
public @interface CompleteJobCaseReviewApiDocs {
}
