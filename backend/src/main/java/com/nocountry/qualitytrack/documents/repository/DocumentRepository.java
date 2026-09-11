package com.nocountry.qualitytrack.documents.repository;

import com.nocountry.qualitytrack.documents.entity.Document;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Override
    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdBy"
    })
    Optional<Document> findById(Long id);

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdBy"
    })
    Optional<Document> findByIdAndJobCase_Id(Long documentId, Long caseId);

    @EntityGraph(attributePaths = {
            "jobCase",
            "createdBy"
    })
    List<Document> findAllByJobCase_IdOrderByCreatedAtAsc(Long caseId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select d
            from Document d
            left join fetch d.jobCase jc
            left join fetch jc.customerRequest cr
            left join fetch cr.customer c
            join fetch d.createdBy
            where d.id = :documentId
              and jc.id = :caseId
            """)
    Optional<Document> findByIdAndCaseIdForUpdate(
            @Param("documentId") Long documentId,
            @Param("caseId") Long caseId
    );
}
