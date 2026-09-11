package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentSummaryResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.documents.storage.DocumentStorage;
import com.nocountry.qualitytrack.documents.storage.StoredDocumentFile;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private DocumentVersionRepository documentVersionRepository;

    @Mock
    private JobCaseRepository jobCaseRepository;

    @Mock
    private DocumentAccessService accessService;

    @Mock
    private DocumentStorage storage;

    @Mock
    private JobCase jobCase;

    @Mock
    private CustomerRequest customerRequest;

    @Mock
    private Customer customer;

    @Mock
    private User user;

    private DocumentService service;

    @BeforeEach
    void setUp() {
        service = new DocumentService(
                documentRepository,
                documentVersionRepository,
                jobCaseRepository,
                accessService,
                storage
        );
    }

    @Test
    void createsDocumentWithVersionOne() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano.pdf",
                "application/pdf",
                "contenido".getBytes()
        );

        stubCaseCustomer();
        when(jobCaseRepository.findById(12L)).thenReturn(Optional.of(jobCase));
        when(accessService.requireCanCreate(10L, jobCase)).thenReturn(user);
        when(user.getId()).thenReturn(10L);
        when(user.getFirstName()).thenReturn("Ana");
        when(user.getLastName()).thenReturn("López");
        when(documentRepository.saveAndFlush(any(Document.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(storage.store(
                eq(20L),
                eq(12L),
                eq(1),
                eq("plano.pdf"),
                any(InputStream.class)
        )).thenReturn(new StoredDocumentFile(
                "qualitytrack/20/case-12/v1-test.pdf",
                9L,
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        ));
        when(documentVersionRepository.saveAndFlush(any(DocumentVersion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DocumentResponse response = service.create(
                10L,
                new CreateDocumentRequest(12L, " drawing ", " Plano de eje ", " Referencia "),
                file
        );

        assertEquals("DRAWING", response.documentType());
        assertEquals("Plano de eje", response.name());
        assertEquals(1, response.currentVersion().version());
        assertEquals("plano.pdf", response.currentVersion().fileName());
    }

    @Test
    void addsNextVersionWithoutReplacingPreviousOne() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano-rev-b.pdf",
                "application/pdf",
                "revision".getBytes()
        );
        Document document = Document.create(jobCase, "DRAWING", "Plano", null, user);

        stubCaseCustomer();
        when(documentRepository.findByIdAndCaseIdForUpdate(7L, 12L))
                .thenReturn(Optional.of(document));
        when(accessService.requireCanAddVersion(10L, document)).thenReturn(user);
        when(documentVersionRepository.findMaxVersionByDocumentId(7L)).thenReturn(1);
        when(storage.store(
                eq(20L),
                eq(12L),
                eq(2),
                eq("plano-rev-b.pdf"),
                any(InputStream.class)
        )).thenReturn(new StoredDocumentFile(
                "qualitytrack/20/case-12/v2-test.pdf",
                8L,
                "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
        ));
        when(documentVersionRepository.saveAndFlush(any(DocumentVersion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DocumentVersionResponse response = service.addVersion(10L, 12L, 7L, file);

        assertEquals(2, response.version());
        assertEquals("plano-rev-b.pdf", response.fileName());
    }

    @Test
    void rejectsDocumentFromDifferentCaseWhenAddingVersion() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano-rev-b.pdf",
                "application/pdf",
                "revision".getBytes()
        );

        when(documentRepository.findByIdAndCaseIdForUpdate(7L, 12L))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> service.addVersion(10L, 12L, 7L, file)
        );
    }

    @Test
    void customerListOnlyIncludesCustomerCreatedDocuments() {
        User internalCreator = org.mockito.Mockito.mock(User.class);
        Document customerDocument = Document.create(jobCase, "DRAWING", "Plano cliente", null, user);
        Document internalDocument = Document.create(jobCase, "SPECIFICATION", "Nota interna", null, internalCreator);

        when(jobCaseRepository.findById(12L)).thenReturn(Optional.of(jobCase));
        when(accessService.requireCanReadCase(10L, jobCase)).thenReturn(user);
        when(user.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(internalCreator.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(documentRepository.findAllByJobCase_IdOrderByCreatedAtAsc(12L))
                .thenReturn(List.of(customerDocument, internalDocument));

        List<DocumentSummaryResponse> response = service.listByCase(10L, 12L);

        assertEquals(1, response.size());
        assertEquals("Plano cliente", response.get(0).name());
    }

    private void stubCaseCustomer() {
        when(jobCase.getId()).thenReturn(12L);
        when(jobCase.getCustomerRequest()).thenReturn(customerRequest);
        when(customerRequest.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(20L);
    }
}
