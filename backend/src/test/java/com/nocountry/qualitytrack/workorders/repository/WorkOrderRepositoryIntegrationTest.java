package com.nocountry.qualitytrack.workorders.repository;

import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
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
    void repositoryMapsCreatedWorkOrderWithApprovedQuotationAndPlanning() {
        Fixture fixture = createFixture("mapping");
        Long workOrderId = insertWorkOrder(
                fixture,
                "OT-MAPPING",
                "CREATED"
        );

        WorkOrder workOrder = workOrderRepository.findById(workOrderId).orElseThrow();

        assertEquals("OT-MAPPING", workOrder.getWorkOrderNumber());
        assertEquals(WorkOrderStatus.CREATED, workOrder.getStatus());
        assertEquals(WorkOrderPriority.NORMAL, workOrder.getPriority());
        assertEquals(LocalDate.of(2026, 10, 1), workOrder.getPlannedStartDate());
        assertEquals(LocalDate.of(2026, 10, 15), workOrder.getPlannedEndDate());
        assertEquals(fixture.quotationId(), workOrder.getApprovedQuotation().getId());
    }

    @Test
    void databasePreventsTwoWorkOrdersForSameJobCase() {
        Fixture fixture = createFixture("unique");

        insertWorkOrder(fixture, "OT-UNIQUE-1", "CREATED");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertWorkOrder(
                        fixture,
                        "OT-UNIQUE-2",
                        "CREATED"
                )
        );
    }

    @Test
    void databaseRejectsPlanningEndOnCommittedDelivery() {
        Fixture fixture = createFixture("planning");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> jdbcTemplate.update(
                        """
                        INSERT INTO work_orders (
                            case_id,
                            approved_quotation_id,
                            work_order_number,
                            status,
                            priority,
                            planned_start_date,
                            planned_end_date,
                            agreed_delivery_date,
                            created_by_user_id
                        )
                        VALUES (?, ?, ?, 'CREATED', 'NORMAL', ?, ?, ?, ?)
                        """,
                        fixture.caseId(),
                        fixture.quotationId(),
                        "OT-BAD-DATES",
                        LocalDate.of(2026, 10, 1),
                        LocalDate.of(2026, 10, 20),
                        LocalDate.of(2026, 10, 20),
                        fixture.internalUserId()
                )
        );
    }

    @Test
    void cancelledWorkOrderRequiresCancellationAuditFields() {
        Fixture fixture = createFixture("cancelled");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertWorkOrder(
                        fixture,
                        "OT-CANCELLED",
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
                "Industrias OT " + suffix,
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
                "REQ-OT-" + suffix,
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
                "CASE-OT-" + suffix,
                internalUserId
        );

        Long quotationId = jdbcTemplate.queryForObject(
                """
                INSERT INTO quotations (
                    case_id,
                    quotation_number,
                    revision,
                    status,
                    currency,
                    subtotal,
                    tax_rate,
                    tax,
                    total,
                    valid_until,
                    estimated_delivery_date,
                    sent_at,
                    approved_at,
                    created_by_user_id
                )
                VALUES (
                    ?, ?, 1, 'APPROVED', 'MXN',
                    100.00, 16.0000, 16.00, 116.00,
                    CURRENT_DATE + 10,
                    DATE '2026-10-20',
                    NOW(),
                    NOW(),
                    ?
                )
                RETURNING id
                """,
                Long.class,
                caseId,
                "QT-OT-" + suffix,
                internalUserId
        );

        return new Fixture(internalUserId, caseId, quotationId);
    }

    private Long insertWorkOrder(
            Fixture fixture,
            String workOrderNumber,
            String status
    ) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO work_orders (
                    case_id,
                    approved_quotation_id,
                    work_order_number,
                    status,
                    priority,
                    planned_start_date,
                    planned_end_date,
                    agreed_delivery_date,
                    created_by_user_id
                )
                VALUES (?, ?, ?, ?, 'NORMAL', ?, ?, ?, ?)
                RETURNING id
                """,
                Long.class,
                fixture.caseId(),
                fixture.quotationId(),
                workOrderNumber,
                status,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                fixture.internalUserId()
        );
    }

    private record Fixture(
            Long internalUserId,
            Long caseId,
            Long quotationId
    ) {
    }
}
