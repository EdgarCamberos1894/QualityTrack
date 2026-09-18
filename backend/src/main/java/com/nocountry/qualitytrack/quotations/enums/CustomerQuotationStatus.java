package com.nocountry.qualitytrack.quotations.enums;

public enum CustomerQuotationStatus {
    SENT,
    ADJUSTMENT_REQUESTED,
    APPROVED,
    EXPIRED,
    CANCELLED,
    REPLACED;

    public static CustomerQuotationStatus fromDomain(
            QuotationStatus status,
            boolean adjustmentPending
    ) {
        return switch (status) {
            case SENT -> SENT;
            case APPROVED -> APPROVED;
            case EXPIRED -> EXPIRED;
            case CANCELLED -> CANCELLED;
            case SUPERSEDED -> adjustmentPending ? ADJUSTMENT_REQUESTED : REPLACED;
            case DRAFT -> throw new IllegalArgumentException(
                    "Una cotización DRAFT no tiene estado visible para el cliente."
            );
        };
    }
}
