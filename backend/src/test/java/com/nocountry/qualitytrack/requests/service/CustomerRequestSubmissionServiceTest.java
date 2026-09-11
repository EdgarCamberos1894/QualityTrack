package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.service.DocumentService;
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
                documentService
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
    void createsInitialDocumentsAfterJobCaseExists() {
        SubmitCustomerRequest input = validInput();
        CustomerRequestResponse response = submittedResponse();
        MultipartFile drawing = new MockMultipartFile(
                "documents",
                "plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );
        MultipartFile specification = new MockMultipartFile(
                "documents",
                "ficha-tecnica.pdf",
                "application/pdf",
                "specification".getBytes()
        );

        when(customerRequestService.submit(10L, 20L, input)).thenReturn(response);

        CustomerRequestResponse result = service.submit(
                10L,
                20L,
                input,
                List.of(drawing, specification)
        );

        assertSame(response, result);

        InOrder inOrder = inOrder(customerRequestService, documentService);
        inOrder.verify(customerRequestService).submit(10L, 20L, input);
        inOrder.verify(documentService).create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "REQUEST_ATTACHMENT",
                        "plano.pdf",
                        null
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
    void sanitizesBrowserPathForInitialDocumentName() {
        SubmitCustomerRequest input = validInput();
        CustomerRequestResponse response = submittedResponse();
        MultipartFile drawing = new MockMultipartFile(
                "documents",
                "C:\\fakepath\\plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );

        when(customerRequestService.submit(10L, 20L, input)).thenReturn(response);

        service.submit(10L, 20L, input, List.of(drawing));

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
                "documents",
                "plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );

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
                () -> service.submit(10L, 20L, input, List.of(drawing))
        );

        assertEquals(ApiErrorCode.DOCUMENT_STORAGE_ERROR, exception.getCode());
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
