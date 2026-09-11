package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocument;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerRequestDocumentServiceTest {

    @Mock
    private JobCaseRepository jobCaseRepository;

    @Mock
    private DocumentService documentService;

    @Mock
    private JobCase jobCase;

    @Mock
    private DocumentResponse documentResponse;

    @Mock
    private DocumentVersionResponse versionResponse;

    private CustomerRequestDocumentService service;

    @BeforeEach
    void setUp() {
        service = new CustomerRequestDocumentService(
                jobCaseRepository,
                documentService
        );
    }

    @Test
    void createsDocumentUsingCaseResolvedFromRequest() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );

        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.of(jobCase));
        when(jobCase.getId()).thenReturn(73L);
        when(documentService.create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "REQUEST_ATTACHMENT",
                        "plano.pdf",
                        null
                ),
                file
        )).thenReturn(documentResponse);

        DocumentResponse result = service.create(
                10L,
                20L,
                31L,
                null,
                file
        );

        assertSame(documentResponse, result);
    }

    @Test
    void usesExplicitMetadataWithoutExposingCaseIdToClient() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "archivo.bin",
                "application/octet-stream",
                "content".getBytes()
        );
        CreateRequestDocument metadata = new CreateRequestDocument(
                " DRAWING ",
                " Plano aprobado ",
                " Revisión inicial "
        );

        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.of(jobCase));
        when(jobCase.getId()).thenReturn(73L);
        when(documentService.create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "DRAWING",
                        "Plano aprobado",
                        " Revisión inicial "
                ),
                file
        )).thenReturn(documentResponse);

        DocumentResponse result = service.create(
                10L,
                20L,
                31L,
                metadata,
                file
        );

        assertSame(documentResponse, result);
    }

    @Test
    void forwardsCaseContextWhenAddingVersion() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano-v2.pdf",
                "application/pdf",
                "revision".getBytes()
        );

        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.of(jobCase));
        when(jobCase.getId()).thenReturn(73L);
        when(documentService.addVersion(10L, 73L, 7L, file))
                .thenReturn(versionResponse);

        DocumentVersionResponse result = service.addVersion(
                10L,
                20L,
                31L,
                7L,
                file
        );

        assertSame(versionResponse, result);
    }

    @Test
    void rejectsRequestOutsideCustomerContextBeforeTouchingDocuments() {
        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.list(10L, 20L, 31L)
        );

        assertEquals(ApiErrorCode.RESOURCE_NOT_FOUND, exception.getCode());
        verify(documentService, never()).listByCase(10L, 73L);
    }
}
