package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentContext;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentCenterServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentVersionRepository documentVersionRepository;
    @Mock private WorkOrderDocumentRepository workOrderDocumentRepository;
    @Mock private MaterialLotRepository materialLotRepository;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private DocumentAccessService accessService;

    @Mock private Document document;
    @Mock private DocumentVersion version;
    @Mock private JobCase jobCase;
    @Mock private CustomerRequest customerRequest;
    @Mock private Customer customer;
    @Mock private User creator;
    @Mock private User uploader;

    private DocumentCenterService service;

    @BeforeEach
    void setUp() {
        service = new DocumentCenterService(
                documentRepository,
                documentVersionRepository,
                workOrderDocumentRepository,
                materialLotRepository,
                deliveryRepository,
                accessService
        );
    }

    @Test
    void returnsExistingDocumentWithOperationalReferences() {
        stubDocument();

        when(documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                12L,
                40L,
                "DRAWING",
                null,
                null,
                null
        )).thenReturn(List.of(document));
        when(documentVersionRepository.findLatestByDocumentIds(List.of(7L)))
                .thenReturn(List.of(version));
        when(workOrderDocumentRepository.findWorkOrderIdsByDocumentId(7L))
                .thenReturn(List.of(70L));
        when(materialLotRepository.findIdsByCertificateDocumentId(7L))
                .thenReturn(List.of());
        when(deliveryRepository.findIdsByEvidenceDocumentId(7L))
                .thenReturn(List.of(90L));

        var response = service.search(
                10L,
                40L,
                12L,
                null,
                null,
                null,
                " drawing ",
                DocumentContext.WORK_ORDER
        );

        assertEquals(1, response.size());
        assertEquals(7L, response.get(0).id());
        assertEquals(21L, response.get(0).currentVersion().id());
        assertEquals(List.of(70L), response.get(0).workOrderIds());
        assertEquals(List.of(90L), response.get(0).deliveryIds());
        assertTrue(response.get(0).contexts().contains(DocumentContext.WORK_ORDER));
        assertTrue(response.get(0).contexts().contains(DocumentContext.DELIVERY));
        verify(accessService).requireInternalReader(10L);
    }

    @Test
    void filtersByDerivedDocumentContextWithoutDuplicatingRecords() {
        stubDocument();

        when(documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                null,
                null,
                null,
                null,
                null,
                null
        )).thenReturn(List.of(document));
        when(documentVersionRepository.findLatestByDocumentIds(List.of(7L)))
                .thenReturn(List.of(version));
        when(workOrderDocumentRepository.findWorkOrderIdsByDocumentId(7L))
                .thenReturn(List.of());
        when(materialLotRepository.findIdsByCertificateDocumentId(7L))
                .thenReturn(List.of());
        when(deliveryRepository.findIdsByEvidenceDocumentId(7L))
                .thenReturn(List.of());

        var response = service.search(
                10L,
                null,
                null,
                null,
                null,
                null,
                null,
                DocumentContext.MATERIAL
        );

        assertTrue(response.isEmpty());
        verify(accessService).requireInternalReader(10L);
    }

    private void stubDocument() {
        when(document.getId()).thenReturn(7L);
        when(document.getJobCase()).thenReturn(jobCase);
        when(document.getDocumentType()).thenReturn("DRAWING");
        when(document.getName()).thenReturn("Plano de eje");
        when(document.getDescription()).thenReturn("Plano vigente");
        when(document.getCreatedBy()).thenReturn(creator);
        when(document.getCreatedAt()).thenReturn(Instant.parse("2026-09-20T10:00:00Z"));

        when(jobCase.getId()).thenReturn(12L);
        when(jobCase.getCustomerRequest()).thenReturn(customerRequest);
        when(customerRequest.getId()).thenReturn(30L);
        when(customerRequest.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(40L);

        when(creator.getId()).thenReturn(10L);
        when(creator.getFirstName()).thenReturn("Ana");
        when(creator.getLastName()).thenReturn("López");

        when(version.getId()).thenReturn(21L);
        when(version.getDocument()).thenReturn(document);
        when(version.getVersion()).thenReturn(2);
        when(version.getFileName()).thenReturn("plano-v2.pdf");
        when(version.getMimeType()).thenReturn("application/pdf");
        when(version.getFileSize()).thenReturn(100L);
        when(version.getChecksum()).thenReturn(
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        when(version.getUploadedBy()).thenReturn(uploader);
        when(version.getUploadedAt()).thenReturn(Instant.parse("2026-09-21T10:00:00Z"));
        when(uploader.getId()).thenReturn(11L);
        when(uploader.getFirstName()).thenReturn("Luis");
        when(uploader.getLastName()).thenReturn("Pérez");
    }
}
