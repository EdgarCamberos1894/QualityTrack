package com.nocountry.qualitytrack.nonconformities.entity;

import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quality.enums.QualityInspectionStatus;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "non_conformities")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NonConformity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "non_conformity_number", nullable = false, length = 30, unique = true)
    private String nonConformityNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quality_inspection_id", nullable = false)
    private QualityInspection qualityInspection;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NonConformityStatus status;

    @Column(name = "affected_quantity")
    private Integer affectedQuantity;

    @Column(length = 50)
    private String severity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column
    private NonConformityDisposition disposition;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "opened_by_user_id", nullable = false)
    private User openedByUser;

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private NonConformity(
            String nonConformityNumber,
            WorkOrder workOrder,
            QualityInspection qualityInspection,
            User openedByUser,
            Instant openedAt
    ) {
        this.nonConformityNumber = requireText(
                nonConformityNumber,
                "El número de no conformidad es obligatorio."
        );
        this.workOrder = Objects.requireNonNull(workOrder);
        this.qualityInspection = Objects.requireNonNull(qualityInspection);
        this.openedByUser = Objects.requireNonNull(openedByUser);
        this.openedAt = Objects.requireNonNull(openedAt);

        if (qualityInspection.getStatus() != QualityInspectionStatus.REJECTED) {
            throw new IllegalStateException(
                    "La no conformidad solo puede abrirse desde una inspección REJECTED."
            );
        }
        if (workOrder.getStatus() != WorkOrderStatus.QUALITY_HOLD) {
            throw new IllegalStateException(
                    "La orden debe estar QUALITY_HOLD al abrir la no conformidad."
            );
        }
        WorkOrder inspectionWorkOrder = qualityInspection.getWorkOrder();
        boolean sameWorkOrder = inspectionWorkOrder == workOrder
                || (
                inspectionWorkOrder.getId() != null
                        && workOrder.getId() != null
                        && inspectionWorkOrder.getId().equals(workOrder.getId())
        );

        if (!sameWorkOrder) {
            throw new IllegalArgumentException(
                    "La inspección no pertenece a la orden de trabajo indicada."
            );
        }

        this.status = NonConformityStatus.OPEN;
    }

    public static NonConformity open(
            String nonConformityNumber,
            WorkOrder workOrder,
            QualityInspection qualityInspection,
            User openedByUser,
            Instant openedAt
    ) {
        return new NonConformity(
                nonConformityNumber,
                workOrder,
                qualityInspection,
                openedByUser,
                openedAt
        );
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
