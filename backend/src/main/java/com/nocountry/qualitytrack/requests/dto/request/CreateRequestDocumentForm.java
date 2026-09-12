package com.nocountry.qualitytrack.requests.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "Formulario multipart para agregar un documento a una solicitud existente.")
public record CreateRequestDocumentForm(
        @Size(max = 50)
        @Schema(
                description = "Tipo canónico opcional del documento. Si se omite, se usa REQUEST_ATTACHMENT.",
                example = "TECHNICAL_DRAWING"
        )
        String documentType,

        @Size(max = 255)
        @Schema(
                description = "Nombre lógico opcional. Si se omite, se usa el nombre original del archivo.",
                example = "Plano técnico del eje"
        )
        String name,

        @Size(max = 2000)
        @Schema(
                description = "Descripción opcional del documento.",
                example = "Plano actualizado con tolerancias dimensionales."
        )
        String description,

        @NotNull
        @Schema(
                description = "Archivo que se agregará como versión 1 del documento.",
                type = "string",
                format = "binary"
        )
        MultipartFile file
) {

    public CreateRequestDocument toMetadata() {
        return new CreateRequestDocument(
                documentType,
                name,
                description
        );
    }
}
