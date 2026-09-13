package com.nocountry.qualitytrack.requests.documentation.schema;

import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocument;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequestForm;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Schema(description = "Contrato multipart para enviar una solicitud con archivos binarios y metadata opcional por archivo.")
public class SubmitCustomerRequestMultipartSchema extends SubmitCustomerRequestForm {

    @ArraySchema(
            arraySchema = @Schema(
                    description = "Metadata opcional de los archivos enviados en documents. Si se informa, debe contener exactamente un elemento por archivo y conservar el mismo orden. Un objeto vacío aplica los valores por defecto."
            ),
            schema = @Schema(implementation = CreateRequestDocument.class)
    )
    private List<CreateRequestDocument> documentsMetadata;
}
