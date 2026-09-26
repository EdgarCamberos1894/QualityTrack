package com.nocountry.qualitytrack.workorders.entity;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "work_orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false, unique = true)
    private JobCase jobCase;

    @Column(name = "work_order_number", nullable = false, length = 30, unique = true)
    private String workOrderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status;

    @Column(name = "agreed_delivery_date", nullable = false)
    private LocalDate agreedDeliveryDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_user_id")
    private User cancelledByUser;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private WorkOrder(JobCase jobCase, String workOrderNumber, LocalDate agreedDeliveryDate, User createdByUser) {
        this.jobCase = Objects.requireNonNull(jobCase);
        this.workOrderNumber = requireText(workOrderNumber, "El número de orden de trabajo es obligatorio.");
        this.agreedDeliveryDate = Objects.requireNonNull(agreedDeliveryDate);
        this.createdByUser = Objects.requireNonNull(createdByUser);
        this.status = WorkOrderStatus.PLANNING;
    }

    public static WorkOrder plan(JobCase jobCase, String workOrderNumber, LocalDate agreedDeliveryDate, User createdByUser) {
        return new WorkOrder(jobCase, workOrderNumber, agreedDeliveryDate, createdByUser);
    }

    public void cancel(User actor, String reason, Instant cancelledAt) {
        if (status != WorkOrderStatus.PLANNING) {
            throw new IllegalStateException("Solo una orden de trabajo en PLANNING puede cancelarse en esta etapa.");
        }

        this.cancelledByUser = Objects.requireNonNull(actor);
        this.cancellationReason = normalizeOptional(reason);
        this.cancelledAt = Objects.requireNonNull(cancelledAt);
        this.status = WorkOrderStatus.CANCELLED;
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
