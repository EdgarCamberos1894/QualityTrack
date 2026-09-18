package com.nocountry.qualitytrack.quotations.dto.response;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.CustomerQuotationStatus;\nimport com.nocountry.qualitytrack.quotations.enums.QuotationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record CustomerQuotationDetailResponse(
        Long id,
        String caseNumber,
        String requestNumber,
        String quotationNumber,
        Integer revision,
        QuotationStatus status,
        String currency,
        BigDecimal subtotal,
        BigDecimal taxRate,
        BigDecimal tax,
        BigDecimal total,
        LocalDate validUntil,
        LocalDate estimatedDeliveryDate,
        String adjustmentNotes,
        Instant sentAt,
        Instant approvedAt,
        Instant cancelledAt,
        String cancellationReason,
        List<QuotationItemResponse> items
) {
    public static CustomerQuotationDetailResponse from(Quotation quotation) {
        return from(
                quotation,
                CustomerQuotationStatus.fromDomain(quotation.getStatus(), false),
                quotation.getAdjustmentNotes()
        );
    }

    public static CustomerQuotationDetailResponse from(
            Quotation quotation,
            CustomerQuotationStatus customerStatus,
            String adjustmentNotes
    ) {
        return new CustomerQuotationDetailResponse(
                quotation.getId(),
                quotation.getJobCase().getCaseNumber(),
                quotation.getJobCase().getCustomerRequest().getRequestNumber(),
                quotation.getQuotationNumber(),
                quotation.getRevision(),
                quotation.getStatus(),
                quotation.getCurrency(),
                quotation.getSubtotal(),
                quotation.getTaxRate(),
                quotation.getTax(),
                quotation.getTotal(),
                quotation.getValidUntil(),
                quotation.getEstimatedDeliveryDate(),
                quotation.getAdjustmentNotes(),
                quotation.getSentAt(),
                quotation.getApprovedAt(),
                quotation.getCancelledAt(),
                quotation.getCancellationReason(),
                quotation.getItems().stream().map(QuotationItemResponse::from).toList()
        );
    }
}
