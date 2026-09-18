package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.quotations.dto.response.CustomerQuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.dto.response.CustomerQuotationResponse;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationResponse;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final QuotationAccessPolicy accessPolicy;

    @Transactional(readOnly = true)
    public List<QuotationResponse> listInternal(Long currentUserId) {
        accessPolicy.requireInternalReader(currentUserId);

        return quotationRepository.findCurrentRevisions()
                .stream()
                .map(QuotationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuotationDetailResponse getInternal(Long currentUserId, Long quotationId) {
        accessPolicy.requireInternalReader(currentUserId);
        return QuotationDetailResponse.from(requireDetail(quotationId));
    }

    @Transactional(readOnly = true)
    public List<CustomerQuotationResponse> listForCustomer(
            Long currentUserId,
            Long customerId
    ) {
        accessPolicy.requireCustomerReader(currentUserId, customerId);

        return quotationRepository
                .findLatestVisibleRevisionsForCustomer(
                        customerId,
                        QuotationStatus.DRAFT
                )
                .stream()
                .map(CustomerQuotationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerQuotationDetailResponse getForCustomer(
            Long currentUserId,
            Long customerId,
            Long quotationId
    ) {
        accessPolicy.requireCustomerReader(currentUserId, customerId);
        Quotation quotation = requireDetail(quotationId);

        if (!customerId.equals(quotation.getJobCase().getCustomerRequest().getCustomer().getId())
                || quotation.getStatus() == QuotationStatus.DRAFT) {
            throw notFound();
        }

        Quotation nextRevision = quotation.getStatus() == QuotationStatus.SUPERSEDED
                ? quotationRepository.findByQuotationNumberAndRevision(
                        quotation.getQuotationNumber(),
                        quotation.getRevision() + 1
                ).orElse(null)
                : null;

        boolean adjustmentPending = nextRevision != null
                && nextRevision.getStatus() == QuotationStatus.DRAFT;

        String adjustmentNotes = nextRevision != null
                ? nextRevision.getAdjustmentNotes()
                : quotation.getAdjustmentNotes();

        return CustomerQuotationDetailResponse.from(
                quotation,
                CustomerQuotationStatus.fromDomain(
                        quotation.getStatus(),
                        adjustmentPending
                ),
                adjustmentNotes
        );
    }

    private Quotation requireDetail(Long quotationId) {
        return quotationRepository.findDetailById(quotationId)
                .orElseThrow(this::notFound);
    }

    private BusinessException notFound() {
        return new BusinessException(
                ApiErrorCode.RESOURCE_NOT_FOUND,
                "No se encontró la cotización."
        );
    }
}
