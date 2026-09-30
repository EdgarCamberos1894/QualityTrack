ALTER TABLE job_cases
    DROP CONSTRAINT chk_job_cases_status;

ALTER TABLE job_cases
    ADD CONSTRAINT chk_job_cases_status CHECK (
        status IN (
            'SUBMITTED',
            'UNDER_REVIEW',
            'WAITING_CUSTOMER_INFO',
            'READY_FOR_QUOTATION',
            'IN_PRODUCTION',
            'COMPLETED',
            'CANCELLED'
        )
    ),
    ADD CONSTRAINT chk_job_cases_closed_state CHECK (
        (
            status IN ('COMPLETED', 'CANCELLED')
            AND closed_at IS NOT NULL
        )
        OR
        (
            status NOT IN ('COMPLETED', 'CANCELLED')
            AND closed_at IS NULL
        )
    );
