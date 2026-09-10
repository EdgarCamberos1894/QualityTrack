package com.nocountry.qualitytrack.customers.repository;

import com.nocountry.qualitytrack.customers.entity.CustomerInvitation;
import com.nocountry.qualitytrack.customers.enums.CustomerInvitationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface CustomerInvitationRepository extends JpaRepository<CustomerInvitation, Long> {

    Optional<CustomerInvitation> findByCustomer_IdAndEmailAndStatus(
            Long customerId,
            String email,
            CustomerInvitationStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CustomerInvitation> findByTokenHash(String tokenHash);
}
