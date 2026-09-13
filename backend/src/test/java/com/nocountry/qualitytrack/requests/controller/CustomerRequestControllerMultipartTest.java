package com.nocountry.qualitytrack.requests.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocument;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocumentForm;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.service.CustomerRequestDocumentService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestSubmissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.bind.support.WebDataBinderFactory;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CustomerRequestControllerMultipartTest {

    @Mock
    private CustomerRequestService customerRequestService;

    @Mock
    private CustomerRequestSubmissionService customerRequestSubmissionService;

    @Mock
    private CustomerRequestDocumentService customerRequestDocumentService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        CustomerRequestController controller = new CustomerRequestController(
                customerRequestService,
                customerRequestSubmissionService,
                customerRequestDocumentService
        );

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new CurrentUserIdResolver())
                .build();
    }

    @Test
    void bindsInitialDocumentsAsNestedMultipartObjectsWithIndependentMetadata() throws Exception {
        LocalDate deliveryDate = LocalDate.now().plusDays(10);
        MockMultipartFile drawing = new MockMultipartFile(
                "documents[0].file",
                "plano.png",
                "image/png",
                new byte[]{1, 2, 3}
        );
        MockMultipartFile referenceImage = new MockMultipartFile(
                "documents[1].file",
                "referencia.png",
                "image/png",
                new byte[]{4, 5, 6}
        );
        CustomerRequestResponse response = mock(CustomerRequestResponse.class);

        when(customerRequestSubmissionService.submit(eq(10L), eq(1L), any(), any()))
                .thenReturn(response);

        mockMvc.perform(multipart("/api/v1/customers/{customerId}/requests", 1L)
                        .file(drawing)
                        .file(referenceImage)
                        .param("customerReference", "OC-2026-0912-EJE-01")
                        .param("title", "Fabricación de eje de transmisión")
                        .param("description", "Fabricar conforme al plano proporcionado.")
                        .param("quantity", "20")
                        .param("materialRequirementType", "SPECIFIED")
                        .param("materialRequirement", "Acero inoxidable AISI 304")
                        .param("requestedDeliveryDate", deliveryDate.toString())
                        .param("documents[0].documentType", "TECHNICAL_DRAWING")
                        .param("documents[0].name", "Plano técnico del eje")
                        .param("documents[0].description", "Plano dimensional para cotización")
                        .param("documents[1].documentType", "REFERENCE_IMAGE")
                        .param("documents[1].name", "Pieza de referencia"))
                .andExpect(status().isCreated());

        ArgumentCaptor<SubmitCustomerRequest> requestCaptor =
                ArgumentCaptor.forClass(SubmitCustomerRequest.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<CreateRequestDocumentForm>> documentsCaptor =
                ArgumentCaptor.forClass(List.class);

        verify(customerRequestSubmissionService).submit(
                eq(10L),
                eq(1L),
                requestCaptor.capture(),
                documentsCaptor.capture()
        );

        SubmitCustomerRequest request = requestCaptor.getValue();
        assertEquals("OC-2026-0912-EJE-01", request.customerReference());
        assertEquals("Fabricación de eje de transmisión", request.title());
        assertEquals(20, request.quantity());
        assertEquals(MaterialRequirementType.SPECIFIED, request.materialRequirementType());
        assertEquals("Acero inoxidable AISI 304", request.materialRequirement());
        assertEquals(deliveryDate, request.requestedDeliveryDate());

        List<CreateRequestDocumentForm> documents = documentsCaptor.getValue();
        assertNotNull(documents);
        assertEquals(2, documents.size());

        CreateRequestDocumentForm first = documents.get(0);
        assertEquals("TECHNICAL_DRAWING", first.getDocumentType());
        assertEquals("Plano técnico del eje", first.getName());
        assertEquals("Plano dimensional para cotización", first.getDescription());
        assertEquals("plano.png", first.getFile().getOriginalFilename());
        assertEquals("image/png", first.getFile().getContentType());

        CreateRequestDocumentForm second = documents.get(1);
        assertEquals("REFERENCE_IMAGE", second.getDocumentType());
        assertEquals("Pieza de referencia", second.getName());
        assertNull(second.getDescription());
        assertEquals("referencia.png", second.getFile().getOriginalFilename());
    }

    @Test
    void acceptsFlatMultipartFormWhenAddingDocumentWithOptionalMetadata() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano-v2.png",
                "image/png",
                new byte[]{4, 5, 6}
        );
        RequestDocumentResponse response = mock(RequestDocumentResponse.class);

        when(customerRequestDocumentService.create(eq(10L), eq(1L), eq(31L), any(), eq(file)))
                .thenReturn(response);

        mockMvc.perform(multipart(
                        "/api/v1/customers/{customerId}/requests/{requestId}/documents",
                        1L,
                        31L
                )
                        .file(file)
                        .param("documentType", "TECHNICAL_DRAWING")
                        .param("name", "Plano técnico actualizado")
                        .param("description", "Incluye nuevas tolerancias dimensionales."))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreateRequestDocument> metadataCaptor =
                ArgumentCaptor.forClass(CreateRequestDocument.class);

        verify(customerRequestDocumentService).create(
                eq(10L),
                eq(1L),
                eq(31L),
                metadataCaptor.capture(),
                eq(file)
        );

        CreateRequestDocument metadata = metadataCaptor.getValue();
        assertEquals("TECHNICAL_DRAWING", metadata.documentType());
        assertEquals("Plano técnico actualizado", metadata.name());
        assertEquals("Incluye nuevas tolerancias dimensionales.", metadata.description());
    }

    @Test
    void acceptsOnlyFileWhenAddingDocument() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "referencia.png",
                "image/png",
                new byte[]{7, 8, 9}
        );
        RequestDocumentResponse response = mock(RequestDocumentResponse.class);

        when(customerRequestDocumentService.create(eq(10L), eq(1L), eq(31L), any(), eq(file)))
                .thenReturn(response);

        mockMvc.perform(multipart(
                "/api/v1/customers/{customerId}/requests/{requestId}/documents",
                1L,
                31L
        ).file(file))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreateRequestDocument> metadataCaptor =
                ArgumentCaptor.forClass(CreateRequestDocument.class);

        verify(customerRequestDocumentService).create(
                eq(10L),
                eq(1L),
                eq(31L),
                metadataCaptor.capture(),
                eq(file)
        );

        CreateRequestDocument metadata = metadataCaptor.getValue();
        assertNull(metadata.documentType());
        assertNull(metadata.name());
        assertNull(metadata.description());
    }

    private static final class CurrentUserIdResolver implements HandlerMethodArgumentResolver {

        @Override
        public boolean supportsParameter(MethodParameter parameter) {
            return parameter.hasParameterAnnotation(CurrentUserId.class);
        }

        @Override
        public Object resolveArgument(
                MethodParameter parameter,
                ModelAndViewContainer mavContainer,
                NativeWebRequest webRequest,
                WebDataBinderFactory binderFactory
        ) {
            return 10L;
        }
    }
}
