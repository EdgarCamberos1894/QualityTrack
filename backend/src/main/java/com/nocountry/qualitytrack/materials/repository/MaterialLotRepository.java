package com.nocountry.qualitytrack.materials.repository;

import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialLotRepository extends JpaRepository<MaterialLot, Long> {

    @EntityGraph(attributePaths = {"material", "certificateDocumentVersion"})
    List<MaterialLot> findAllByMaterial_IdOrderByReceivedAtDesc(Long materialId);
}
