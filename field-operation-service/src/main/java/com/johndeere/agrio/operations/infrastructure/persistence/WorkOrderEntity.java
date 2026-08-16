package com.johndeere.agrio.operations.infrastructure.persistence;

import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * JPA mapping for {@link WorkOrder}. Schema {@code operations},
 * table {@code work_orders}. See {@code V1__create_operations_schema.sql}.
 */
@Entity
@Table(name = "work_orders", schema = "operations")
public class WorkOrderEntity {

    @Id
    @Column(name = "id", nullable = false, length = 64)
    private String id;

    @Column(name = "equipment_id", nullable = false, length = 64)
    private String equipmentId;

    @Column(name = "field_id", length = 64)
    private String fieldId;

    @Column(name = "operator_id", nullable = false, length = 64)
    private String operatorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private WorkOrderStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "operator_notes", columnDefinition = "TEXT")
    private String operatorNotes;

    protected WorkOrderEntity() {
        // JPA
    }

    public static WorkOrderEntity fromDomain(WorkOrder w) {
        var e = new WorkOrderEntity();
        e.id = w.id();
        e.equipmentId = w.equipmentId();
        e.fieldId = w.fieldId();
        e.operatorId = w.operatorId();
        e.status = w.status();
        e.createdAt = w.createdAt();
        e.updatedAt = w.updatedAt();
        e.operatorNotes = w.operatorNotes();
        return e;
    }

    public WorkOrder toDomain() {
        return WorkOrder.rehydrate(id, equipmentId, fieldId, operatorId,
                status, createdAt, updatedAt, operatorNotes);
    }

    public String getId() { return id; }
}
