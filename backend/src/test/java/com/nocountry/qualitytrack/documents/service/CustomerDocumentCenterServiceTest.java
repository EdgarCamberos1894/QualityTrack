package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerDocumentCenterServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentVersionRepository documentVersionRepository;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private DocumentAccessService accessService;

    @Mock private Document customerDocument;
    @Mock private Document evidenceDocument;
    @Mock private Document internalDocument;
    @Mock private DocumentVersion customerVersion;
    @Mock private DocumentVersion evidenceVersion;
    @Mock private DocumentVersion internalVersion;
    @Mock private Delivery dispatchedDelivery;
    @Mock private JobCase jobCase;
    @Mock private CustomerRequest customerRequest;
    @Mock private Customer customer;
    @Mock private User customerCreator;
    @Mock private User internalCreator;
    @Mock private User uploader;

    private CustomerDocumentCenterService service;

    @BeforeEach
    void setUp() {
        service = new CustomerDocumentCenterService(
                documentRepository,
                documentVersionRepository,
                deliveryRepository,
                accessService
        );
    }

    @Test
    void returnsCustomerUploadsAndVisibleDeliveryEvidenceOnly() {
        stubCommonContext(customerDocument, customerVersion, 1L, "Plano cliente");
        stubCommonContext(evidenceDocument, evidenceVersion, 2L, "Evidencia entrega");
        stubCommonContext(internalDocument, internalVersion, 3L, "Plano interno");

        when(customerDocument.getCreatedBy()).thenReturn(customerCreator);
        when(customerCreator.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(customerDocument.getDocumentType()).thenReturn("REQUEST_ATTACHMENT");

        when(evidenceDocument.getCreatedBy()).thenReturn(internalCreator);
        when(evidenceDocument.getDocumentType()).thenReturn("DELIVERY_EVIDENCE");
        when(internalDocument.getCreatedBy()).thenReturn(internalCreator);
        when(internalDocument.getDocumentType()).thenReturn("ENGINEERING_DRAWING");
        when(internalCreator.getAccountType()).thenReturn(AccountType.INTERNAL);

        when(documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                null,
                40L,
                null,
                null,
                null,
                null
        )).thenReturn(List.of(customerDocument, evidenceDocument, internalDocument));
        when(documentVersionRepository.findLatestByDocumentIds(List.of(1L, 2L, 3L)))
                .thenReturn(List.of(customerVersion, evidenceVersion, internalVersion));

        when(dispatchedDelivery.getEvidenceDocumentVersion()).thenReturn(evidenceVersion);
        when(deliveryRepository.findAllByEvidenceDocumentIds(List.of(1L, 2L, 3L)))
                .thenReturn(List.of(dispatchedDelivery));
        when(accessService.isCustomerVisibleDelivery(dispatchedDelivery)).thenReturn(true);

        var response = service.list(20L, 40L);

        assertEquals(2, response.size());
        assertEquals("Plano cliente", response.get(0).name());
        assertEquals("Evidencia entrega", response.get(1).name());
        verify(accessService).requireCustomerReader(20L, 40L);
    }

    private void stubCommonContext(
            Document document,
            DocumentVersion version,
            Long documentId,
            String name
    ) {
        lenient().when(document.getId()).thenReturn(documentId);
        lenient().when(document.getJobCase()).thenReturn(jobCase);
        lenient().when(document.getName()).thenReturn(name);
        lenient().when(document.getDescription()).thenReturn(null);
        lenient().when(document.getCreatedAt())
                .thenReturn(Instant.parse("2026-09-20T10:00:00Z"));

        lenient().when(jobCase.getId()).thenReturn(12L);
        lenient().when(jobCase.getCustomerRequest()).thenReturn(customerRequest);
        lenient().when(customerRequest.getId()).thenReturn(30L);
        lenient().when(customerRequest.getRequestNumber()).thenReturn("REQ-00030");
        lenient().when(customerRequest.getTitle()).thenReturn("Pieza de prueba");
        lenient().when(customerRequest.getCustomer()).thenReturn(customer);
        lenient().when(customer.getId()).thenReturn(40L);

        lenient().when(version.getId()).thenReturn(100L + documentId);
        lenient().when(version.getDocument()).thenReturn(document);
        lenient().when(version.getVersion()).thenReturn(1);
        lenient().when(version.getFileName()).thenReturn("archivo.pdf");
        lenient().when(version.getMimeType()).thenReturn("application/pdf");
        lenient().when(version.getFileSize()).thenReturn(100L);
        lenient().when(version.getChecksum()).thenReturn(
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        lenient().when(version.getUploadedBy()).thenReturn(uploader);
        lenient().when(version.getUploadedAt())
                .thenReturn(Instant.parse("2026-09-21T10:00:00Z"));
        lenient().when(uploader.getId()).thenReturn(11L);
        lenient().when(uploader.getFirstName()).thenReturn("Luis");
        lenient().when(uploader.getLastName()).thenReturn("Pérez");
    }
}
