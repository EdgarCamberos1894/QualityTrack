package com.nocountry.qualitytrack.requests.repository;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobCaseRepository extends JpaRepository<JobCase, Long> {

    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser"
    })
    List<JobCase> findAllByCustomerRequest_Customer_IdOrderByOpenedAtDesc(Long customerId);

    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser"
    })
    Optional<JobCase> findByCustomerRequest_IdAndCustomerRequest_Customer_Id(
            Long requestId,
            Long customerId
    );

    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser"
    })
    List<JobCase> findAllByOrderByOpenedAtDesc();

    @Override
    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser"
    })
    Optional<JobCase> findById(Long id);
}
