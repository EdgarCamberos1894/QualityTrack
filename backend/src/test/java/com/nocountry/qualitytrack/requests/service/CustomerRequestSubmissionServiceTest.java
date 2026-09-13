package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocumentForm;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseSummaryResponse;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerRequestSubmissionServiceTest {

    @Mock
    private CustomerRequestService customerRequestService;

    @Mock
    private DocumentService documentService;

    private CustomerRequestSubmissionService service;

    @BeforeEach
    void setUp() {
        service = new CustomerRequestSubmissionService(
                customerRequestService,
                documentService,
                5
        );
    }

    @Test
    void submitsRequestWithoutDocuments() {
        SubmitCustomerRequest input = validInput();
        CustomerRequestResponse response = submittedResponse();
        when(customerRequestService.submit(10L, 20L, input)).thenReturn(response);

        CustomerRequestResponse result = service.submit(10L, 20L, input, null);

        assertSame(response, result);
        verify(documentService, never()).create(any(), any(), any());
    }

    @Test
    void createsInitialDocumentsWithIndependentMetadataAfterJobCaseExists() {
        SubmitCustomerRequest input = validInput();
        CustomerRequestResponse response = submittedResponse();
        MultipartFile drawing = new MockMultipartFile(
                "documents[0].file",
                "plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );
        MultipartFile specification = new MockMultipartFile(
                "documents[1].file",
                "ficha-tecnica.pdf",
                "application/pdf",
                "specification".getBytes()
        );

        CreateRequestDocumentForm drawingForm = document(
                " TECHNICAL_DRAWING ",
                " Plano técnico del eje ",
                "Plano dimensional para cotización",
                drawing
        );
        CreateRequestDocumentForm specificationForm = document(
                null,
                null,
                null,
                specification
        );

        when(customerRequestService.submit(10L, 20L, input)).thenReturn(response);

        CustomerRequestResponse result = service.submit(
                10L,
                20L,
                input,
                List.of(drawingForm, specificationForm)
        );

        assertSame(response, result);

        InOrder inOrder = inOrder(customerRequestService, documentService);
        inOrder.verify(customerRequestService).submit(10L, 20L, input);
        inOrder.verify(documentService).create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "TECHNICAL_DRAWING",
                        "Plano técnico del eje",
                        "Plano dimensional para cotización"
                ),
                drawing
        );
        inOrder.verify(documentService).create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "REQUEST_ATTACHMENT",
                        "ficha-tecnica.pdf",
                        null
                ),
                specification
        );
    }

    @Test
    void rejectsTooManyDocumentsBeforeCreatingRequest() {
        SubmitCustomerRequest input = validInput();
        MultipartFile file = new MockMultipartFile(
                "documents[0].file",
                "plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );
        CreateRequestDocumentForm document = document(null, null, null, file);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submit(
                        10L,
                        20L,
                        input,
                        List.of(document, document, document, document, document, document)
                )
        );

        assertEquals(ApiErrorCode.VALIDATION_ERROR, exception.getCode());
        verifyNoInteractions(customerRequestService, documentService);
    }

    @Test
    void rejectsDocumentWithoutFileBeforeCreatingRequest() {
        SubmitCustomerRequest input = validInput();
        CreateRequestDocumentForm document = document(
                "TECHNICAL_DRAWING",
                "Plano",
                null,
                null
        );

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submit(10L, 20L, input, List.of(document))
        );

        assertEquals(ApiErrorCode.VALIDATION_ERROR, exception.getCode());
        verifyNoInteractions(customerRequestService, documentService);
    }

    @Test
    void sanitizesBrowserPathWhenMetadataNameIsOmitted() {
        SubmitCustomerRequest input = validInput();
        CustomerRequestResponse response = submittedResponse();
        MultipartFile drawing = new MockMultipartFile(
                "documents[0].file",
                "C:\\fakepath\\plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );
        CreateRequestDocumentForm document = document(null, null, null, drawing);

        when(customerRequestService.submit(10L, 20L, input)).thenReturn(response);

        service.submit(10L, 20L, input, List.of(document));

        verify(documentService).create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "REQUEST_ATTACHMENT",
                        "plano.pdf",
                        null
                ),
                drawing
        );
    }

    @Test
    void propagatesDocumentFailureSoTransactionCanRollback() {
        SubmitCustomerRequest input = validInput();
        CustomerRequestResponse response = submittedResponse();
        MultipartFile drawing = new MockMultipartFile(
                "documents[0].file",
                "plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );
        CreateRequestDocumentForm document = document(null, null, null, drawing);

        when(customerRequestService.submit(10L, 20L, input)).thenReturn(response);
        doThrow(new BusinessException(
                ApiErrorCode.DOCUMENT_STORAGE_ERROR,
                "No fue posible acceder al almacenamiento de documentos."
        )).when(documentService).create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "REQUEST_ATTACHMENT",
                        "plano.pdf",
                        null
                ),
                drawing
        );

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submit(10L, 20L, input, List.of(document))
        );

        assertEquals(ApiErrorCode.DOCUMENT_STORAGE_ERROR, exception.getCode());
    }

    private CreateRequestDocumentForm document(
            String type,
            String name,
            String description,
            MultipartFile file
    ) {
        CreateRequestDocumentForm form = new CreateRequestDocumentForm();
        form.setDocumentType(type);
        form.setName(name);
        form.setDescription(description);
        form.setFile(file);
        return form;
    }

    private SubmitCustomerRequest validInput() {
        return new SubmitCustomerRequest(
                "OC-4587",
                "Eje de transmisión",
                "Fabricar conforme al plano proporcionado.",
                25,
                MaterialRequirementType.SPECIFIED,
                "AISI 4140",
                LocalDate.now().plusDays(30)
        );
    }

    private CustomerRequestResponse submittedResponse() {
        Instant now = Instant.now();

        return new CustomerRequestResponse(
                31L,
                20L,
                "REQ-00000001",
                "OC-4587",
                "Eje de transmisión",
                "Fabricar conforme al plano proporcionado.",
                25,
                MaterialRequirementType.SPECIFIED,
                "AISI 4140",
                LocalDate.now().plusDays(30),
                10L,
                "Ana López",
                now,
                now,
                new JobCaseSummaryResponse(
                        73L,
                        "CASE-00000001",
                        JobCaseStatus.SUBMITTED,
                        null,
                        null,
                        now,
                        null,
                        null,
                        null
                )
        );
    }
}
