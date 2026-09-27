package com.nocountry.qualitytrack.production.repository;

import com.nocountry.qualitytrack.production.entity.OperationExecution;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OperationExecutionRepository extends JpaRepository<OperationExecution, Long> {

    boolean existsByRoutingOperation_IdAndStatus(
            Long routingOperationId,
            OperationExecutionStatus status
    );

    long countByRoutingOperation_Id(Long routingOperationId);

    @Query("""
            select execution.routingOperation.routingSheet.workOrder.id
            from OperationExecution execution
            where execution.id = :executionId
            """)
    Optional<Long> findWorkOrderIdById(@Param("executionId") Long executionId);

    @EntityGraph(attributePaths = {
            "routingOperation",
            "routingOperation.routingSheet",
            "routingOperation.routingSheet.workOrder",
            "operator",
            "machine"
    })
    List<OperationExecution>
    findAllByRoutingOperation_RoutingSheet_WorkOrder_IdOrderByRoutingOperation_SequenceNumberAscAttemptNumberAsc(
            Long workOrderId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select execution
            from OperationExecution execution
            join fetch execution.routingOperation operation
            join fetch operation.routingSheet routingSheet
            join fetch routingSheet.workOrder
            join fetch execution.operator
            left join fetch execution.machine
            where execution.id = :executionId
            """)
    Optional<OperationExecution> findByIdForUpdate(
            @Param("executionId") Long executionId
    );
}
