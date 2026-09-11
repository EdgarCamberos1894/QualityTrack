package com.nocountry.qualitytrack.documents.documentation;

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
        summary = "Agregar documento a una solicitud",
        description = "Agrega un documento a la solicitud indicada. El backend resuelve internamente su JobCase y crea la versión 1 del archivo, por lo que el cliente no necesita conocer ni enviar el caseId. Si no se envía metadata, se usa REQUEST_ATTACHMENT y el nombre del archivo como valores predeterminados."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "Documento y versión inicial creados correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = DocumentApiExamples.DOCUMENT_CREATED)
                )
        ),
        @ApiResponse(responseCode = "400", description = "Metadata o archivo inválidos", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "401", description = "Autenticación requerida", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "403", description = "El usuario no puede subir documentos a la solicitud", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No se encontró la solicitud", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "409", description = "El estado del expediente no admite la operación", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "413", description = "El archivo supera el tamaño máximo permitido", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "503", description = "El almacenamiento de documentos no está disponible", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface CreateDocumentApiDocs {
}
