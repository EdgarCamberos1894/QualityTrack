package com.nocountry.qualitytrack.quotations.repository;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    boolean existsByJobCase_Id(Long caseId);

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser",
            "cancelledByUser"
    })
    List<Quotation> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser",
            "cancelledByUser"
    })
    List<Quotation> findAllByJobCase_CustomerRequest_Customer_IdAndStatusNotOrderByCreatedAtDesc(
            Long customerId,
            QuotationStatus status
    );

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser",
            "cancelledByUser",
            "items"
    })
    @Query("select distinct quotation from Quotation quotation where quotation.id = :quotationId")
    Optional<Quotation> findDetailById(@Param("quotationId") Long quotationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select quotation
            from Quotation quotation
            join fetch quotation.jobCase jobCase
            join fetch jobCase.customerRequest request
            join fetch request.customer customer
            join fetch quotation.createdByUser
            left join fetch quotation.cancelledByUser
            where quotation.id = :quotationId
            """)
    Optional<Quotation> findByIdForUpdate(@Param("quotationId") Long quotationId);

    @Query("""
            select quotation.id
            from Quotation quotation
            where quotation.status = com.nocountry.qualitytrack.quotations.enums.QuotationStatus.SENT
              and quotation.validUntil < :today
            order by quotation.id
            """)
    List<Long> findIdsDueForExpiration(@Param("today") LocalDate today);
}
