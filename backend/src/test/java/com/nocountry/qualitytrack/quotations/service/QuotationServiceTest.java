package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
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
