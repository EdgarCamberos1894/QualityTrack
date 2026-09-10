package com.nocountry.qualitytrack.requests.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RequestReferenceGenerator {

    private final EntityManager entityManager;

    public String nextCustomerRequestNumber() {
        return "REQ-%08d".formatted(nextValue("customer_request_number_seq"));
    }

    public String nextJobCaseNumber() {
        return "CASE-%08d".formatted(nextValue("job_case_number_seq"));
    }

    private long nextValue(String sequenceName) {
        Number value = (Number) entityManager
                .createNativeQuery("SELECT nextval('" + sequenceName + "')")
                .getSingleResult();
        return value.longValue();
    }
}
