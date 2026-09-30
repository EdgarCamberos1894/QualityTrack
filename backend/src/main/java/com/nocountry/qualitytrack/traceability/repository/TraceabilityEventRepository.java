package com.nocountry.qualitytrack.traceability.repository;

import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TraceabilityEventRepository extends JpaRepository<TraceabilityEvent, Long> {

    @EntityGraph(attributePaths = {"jobCase", "performedByUser"})
    List<TraceabilityEvent> findTop8ByOrderByOccurredAtDescIdDesc();

    List<TraceabilityEvent> findAllByJobCase_IdOrderByOccurredAtAscIdAsc(Long caseId);
}
