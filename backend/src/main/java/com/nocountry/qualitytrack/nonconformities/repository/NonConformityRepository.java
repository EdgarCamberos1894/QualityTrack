package com.nocountry.qualitytrack.nonconformities.repository;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NonConformityRepository extends JpaRepository<NonConformity, Long> {

    Optional<NonConformity> findByQualityInspection_Id(Long qualityInspectionId);

    boolean existsByQualityInspection_Id(Long qualityInspectionId);
}
