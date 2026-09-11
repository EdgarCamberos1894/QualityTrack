package com.nocountry.qualitytrack.documents.repository;

import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    @Query("""
            select coalesce(max(v.version), 0)
            from DocumentVersion v
            where v.document.id = :documentId
            """)
    int findMaxVersionByDocumentId(@Param("documentId") Long documentId);

    @EntityGraph(attributePaths = {"uploadedBy"})
    List<DocumentVersion> findAllByDocument_IdOrderByVersionAsc(Long documentId);

    @EntityGraph(attributePaths = {
            "uploadedBy",
            "document",
            "document.jobCase",
            "document.jobCase.customerRequest",
            "document.jobCase.customerRequest.customer",
            "document.createdBy"
    })
    Optional<DocumentVersion> findByIdAndDocument_IdAndDocument_JobCase_Id(
            Long versionId,
            Long documentId,
            Long caseId
    );
}
