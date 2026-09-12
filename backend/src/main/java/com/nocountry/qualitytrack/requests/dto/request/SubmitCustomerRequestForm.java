package com.nocountry.qualitytrack.requests.dto.request;

import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Formulario multipart para enviar una solicitud de cliente junto con sus documentos iniciales.")
public record SubmitCustomerRequestForm(
        @Size(max = 120)
        @Schema(description = "Referencia interna opcional del cliente.", example = "OC-2026-0912-EJE-01")
        String customerReference,

        @NotBlank
        @Size(max = 200)
        @Schema(description = "Título de la solicitud.", example = "Fabricación de eje de transmisión")
        String title,

        @NotBlank
        @Size(max = 5000)
        @Schema(description = "Descripción detallada del trabajo solicitado.")
        String description,

        @NotNull
        @Positive
        @Schema(description = "Cantidad de piezas requeridas.", example = "20")
        Integer quantity,

        @NotNull
        @Schema(description = "Indica si el material fue especificado por el cliente o requiere asesoría.")
        MaterialRequirementType materialRequirementType,

        @NotBlank
        @Size(max = 2000)
        @Schema(description = "Material, norma o requerimiento técnico asociado.", example = "Acero inoxidable AISI 304")
        String materialRequirement,

        @FutureOrPresent
        @Schema(description = "Fecha solicitada de entrega.", example = "2026-09-25", type = "string", format = "date")
        LocalDate requestedDeliveryDate,

        @ArraySchema(
                arraySchema = @Schema(description = "Documentos iniciales opcionales. El máximo se controla mediante DOCUMENT_MAX_FILES_PER_REQUEST (5 por defecto)."),
                schema = @Schema(type = "string", format = "binary")
        )
        List<MultipartFile> documents
) {

    public SubmitCustomerRequest toRequest() {
        return new SubmitCustomerRequest(
                customerReference,
                title,
                description,
                quantity,
                materialRequirementType,
                materialRequirement,
                requestedDeliveryDate
        );
    }
}
