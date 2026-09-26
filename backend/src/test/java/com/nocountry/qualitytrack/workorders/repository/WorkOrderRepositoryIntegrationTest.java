package com.nocountry.qualitytrack.workorders.repository;

import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@Testcontainers
@SpringBootTest(properties = {
        "security.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
        "app.email.resend.api-key=test-api-key",
        "app.email.resend.from=test@qualitytrack.local",
        "app.documents.storage-provider=local",
        "app.documents.storage-root=./target/test-storage/documents"
})
@Transactional
class WorkOrderRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRESQL = new PostgreSQLContainer(
            DockerImageName.parse("postgres:16-alpine")
    );

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Test
    void repositoryMapsPlanningWorkOrderCreatedByMigrationSchema() {
        Fixture fixture = createFixture("mapping");
        Long workOrderId = insertWorkOrder(
                fixture.caseId(),
                fixture.internalUserId(),
                "WO-MAPPING",
                "PLANNING"
        );

        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();

        assertEquals("WO-MAPPING", workOrder.getWorkOrderNumber());
        assertEquals(WorkOrderStatus.PLANNING, workOrder.getStatus());
        assertEquals(fixture.caseId(), workOrder.getJobCase().getId());
    }

    @Test
    void databasePreventsTwoWorkOrdersForSameJobCase() {
        Fixture fixture = createFixture("unique");

        insertWorkOrder(
                fixture.caseId(),
                fixture.internalUserId(),
                "WO-UNIQUE-1",
                "PLANNING"
        );

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertWorkOrder(
                        fixture.caseId(),
                        fixture.internalUserId(),
                        "WO-UNIQUE-2",
                        "PLANNING"
                )
        );
    }

    @Test
    void cancelledWorkOrderRequiresCancellationAuditFields() {
        Fixture fixture = createFixture("cancelled");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertWorkOrder(
                        fixture.caseId(),
                        fixture.internalUserId(),
                        "WO-CANCELLED",
                        "CANCELLED"
                )
        );
    }

    private Fixture createFixture(String suffix) {
        Long internalUserId = jdbcTemplate.queryForObject(
                """
                INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    password_hash,
                    account_type,
                    status
                )
                VALUES (?, ?, ?, ?, 'INTERNAL', 'ACTIVE')
                RETURNING id
                """,
                Long.class,
                "Patricia",
                "Producción",
                "production-" + suffix + "@qualitytrack.test",
                "test-hash"
        );

        Long customerUserId = jdbcTemplate.queryForObject(
                """
                INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    password_hash,
                    account_type,
                    status
                )
                VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')
                RETURNING id
                """,
                Long.class,
                "Ana",
                "Cliente",
                "customer-workorder-" + suffix + "@qualitytrack.test",
                "test-hash"
        );

        Long customerId = jdbcTemplate.queryForObject(
                """
                INSERT INTO customers (
                    name,
                    created_by_user_id
                )
                VALUES (?, ?)
                RETURNING id
                """,
                Long.class,
                "Industrias WO " + suffix,
                internalUserId
        );

        Long requestId = jdbcTemplate.queryForObject(
                """
                INSERT INTO customer_requests (
                    customer_id,
                    request_number,
                    title,
                    description,
                    quantity,
                    material_requirement_type,
                    material_requirement,
                    requested_by_user_id
                )
                VALUES (?, ?, ?, ?, 25, 'SPECIFIED', 'AISI 4140', ?)
                RETURNING id
                """,
                Long.class,
                customerId,
                "REQ-WO-" + suffix,
                "Eje " + suffix,
                "Fabricar conforme a plano.",
                customerUserId
        );

        Long caseId = jdbcTemplate.queryForObject(
                """
                INSERT INTO job_cases (
                    request_id,
                    case_number,
                    status,
                    assigned_to_user_id,
                    assigned_at,
                    opened_at
                )
                VALUES (?, ?, 'IN_PRODUCTION', ?, NOW(), NOW())
                RETURNING id
                """,
                Long.class,
                requestId,
                "CASE-WO-" + suffix,
                internalUserId
        );

        return new Fixture(internalUserId, caseId);
    }

    private Long insertWorkOrder(
            Long caseId,
            Long internalUserId,
            String workOrderNumber,
            String status
    ) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO work_orders (
                    case_id,
                    work_order_number,
                    status,
                    agreed_delivery_date,
                    created_by_user_id
                )
                VALUES (?, ?, ?, ?, ?)
                RETURNING id
                """,
                Long.class,
                caseId,
                workOrderNumber,
                status,
                LocalDate.of(2026, 10, 20),
                internalUserId
        );
    }

    private record Fixture(
            Long internalUserId,
            Long caseId
    ) {
    }
}
