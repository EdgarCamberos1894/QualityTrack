package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.CustomerQuotationStatus;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuotationServiceTest {

    @Mock
    private QuotationRepository quotationRepository;

    @Mock
    private QuotationAccessPolicy accessPolicy;

    private QuotationService service;

    @BeforeEach
    void setUp() {
        service = new QuotationService(quotationRepository, accessPolicy);
    }

    @Test
    void internalListUsesOnlyCurrentRevisionOfEachQuotationFlow() {
        when(quotationRepository.findCurrentRevisions()).thenReturn(List.of());

        var response = service.listInternal(10L);

        assertTrue(response.isEmpty());
        verify(accessPolicy).requireInternalReader(10L);
        verify(quotationRepository).findCurrentRevisions();
    }

    @Test
    void customerDetailExposesAdjustmentRequestedWhileNextRevisionIsDraft() {
        Quotation current = mock(Quotation.class);
        Quotation next = mock(Quotation.class);
        JobCase jobCase = mock(JobCase.class);
        CustomerRequest request = mock(CustomerRequest.class);
        Customer customer = mock(Customer.class);

        when(quotationRepository.findDetailById(1L)).thenReturn(Optional.of(current));
        when(current.getJobCase()).thenReturn(jobCase);
        when(jobCase.getCustomerRequest()).thenReturn(request);
        when(request.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(20L);
        when(current.getStatus()).thenReturn(QuotationStatus.SUPERSEDED);
        when(current.getQuotationNumber()).thenReturn("QT-00000001");
        when(current.getRevision()).thenReturn(1);
        when(current.getItems()).thenReturn(List.of());
        when(quotationRepository.findByQuotationNumberAndRevision(
                "QT-00000001",
                2
        )).thenReturn(Optional.of(next));
        when(next.getStatus()).thenReturn(QuotationStatus.DRAFT);
        when(next.getAdjustmentNotes()).thenReturn("Reducir el plazo de entrega.");

        var response = service.getForCustomer(42L, 20L, 1L);

        assertEquals(CustomerQuotationStatus.ADJUSTMENT_REQUESTED, response.customerStatus());
        assertEquals("Reducir el plazo de entrega.", response.adjustmentNotes());
        verify(accessPolicy).requireCustomerReader(42L, 20L);
    }

    @Test
    void customerListUsesLatestNonDraftRevisionOfEachQuotationFlow() {
        when(quotationRepository.findLatestVisibleRevisionsForCustomer(
                20L,
                QuotationStatus.DRAFT
        )).thenReturn(List.of());

        var response = service.listForCustomer(42L, 20L);

        assertTrue(response.isEmpty());
        verify(accessPolicy).requireCustomerReader(42L, 20L);
        verify(quotationRepository).findLatestVisibleRevisionsForCustomer(
                20L,
                QuotationStatus.DRAFT
        );
    }
}
