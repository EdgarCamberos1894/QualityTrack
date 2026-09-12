package com.nocountry.qualitytrack.requests.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
    void acceptsFlatMultipartFormWithPngDocument() throws Exception {
        LocalDate deliveryDate = LocalDate.now().plusDays(10);
        MockMultipartFile drawing = new MockMultipartFile(
                "documents",
                "plano.png",
                "image/png",
                new byte[]{1, 2, 3}
        );
        CustomerRequestResponse response = mock(CustomerRequestResponse.class);

        when(customerRequestSubmissionService.submit(eq(10L), eq(1L), any(), any()))
                .thenReturn(response);

        mockMvc.perform(multipart("/api/v1/customers/{customerId}/requests", 1L)
                        .file(drawing)
                        .param("customerReference", "OC-2026-0912-EJE-01")
                        .param("title", "Fabricación de eje de transmisión")
                        .param("description", "Fabricar conforme al plano proporcionado.")
                        .param("quantity", "20")
                        .param("materialRequirementType", "SPECIFIED")
                        .param("materialRequirement", "Acero inoxidable AISI 304")
                        .param("requestedDeliveryDate", deliveryDate.toString()))
                .andExpect(status().isCreated());

        ArgumentCaptor<SubmitCustomerRequest> requestCaptor =
                ArgumentCaptor.forClass(SubmitCustomerRequest.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<MultipartFile>> documentsCaptor =
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

        List<MultipartFile> documents = documentsCaptor.getValue();
        assertNotNull(documents);
        assertEquals(1, documents.size());
        assertEquals("plano.png", documents.get(0).getOriginalFilename());
        assertEquals("image/png", documents.get(0).getContentType());
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
