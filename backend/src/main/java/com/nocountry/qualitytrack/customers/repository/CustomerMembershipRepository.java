package com.nocountry.qualitytrack.customers.repository;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerMembershipRepository extends JpaRepository<CustomerMembership, Long> {

    boolean existsByCustomer_IdAndUser_IdAndStatus(
            Long customerId,
            Long userId,
            CustomerMembershipStatus status
    );

    List<CustomerMembership> findAllByCustomer_IdOrderByCreatedAtAsc(Long customerId);
}
