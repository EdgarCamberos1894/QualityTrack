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
        summary = "Consultar historial de versiones",
        description = "Devuelve todas las versiones de un documento ordenadas desde la primera hasta la más reciente. Cada versión conserva archivo, checksum, usuario y fecha de carga."
)
@ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Historial consultado correctamente",
                content = @Content(
                        mediaType = "application/json",
                        schema = @Schema(implementation = com.nocountry.qualitytrack.shared.response.ApiResponse.class),
                        examples = @ExampleObject(value = DocumentApiExamples.DOCUMENT_VERSIONS_RETRIEVED)
                )
        ),
        @ApiResponse(responseCode = "403", description = "El usuario no puede consultar el documento", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))),
        @ApiResponse(responseCode = "404", description = "No se encontró el documento", content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class)))
})
public @interface ListDocumentVersionsApiDocs {
}
