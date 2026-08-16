package com.johndeere.agrio.operations.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Pure domain model for a Work Order.
 *
 * <p>No framework imports. Constructed via factory methods that validate
 * invariants; mutations go through {@link #withStatus(WorkOrderStatus, String)}
 * which checks the transition against the current status.
 */
public final class WorkOrder {

    private final String id;
    private final String equipmentId;
    private final String fieldId;
    private final String operatorId;
    private final WorkOrderStatus status;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final String operatorNotes;

    private WorkOrder(
            String id,
            String equipmentId,
            String fieldId,
            String operatorId,
            WorkOrderStatus status,
            Instant createdAt,
            Instant updatedAt,
            String operatorNotes) {
        this.id = Objects.requireNonNull(id, "id");
        this.equipmentId = Objects.requireNonNull(equipmentId, "equipmentId");
        this.fieldId = fieldId;
        this.operatorId = Objects.requireNonNull(operatorId, "operatorId");
        this.status = Objects.requireNonNull(status, "status");
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
        this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt");
        this.operatorNotes = operatorNotes;
    }

    public static WorkOrder create(
            String id,
            String equipmentId,
            String fieldId,
            String operatorId,
            Instant now) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("WorkOrder id must not be blank");
        }
        if (equipmentId == null || equipmentId.isBlank()) {
            throw new IllegalArgumentException("equipmentId must not be blank");
        }
        if (operatorId == null || operatorId.isBlank()) {
            throw new IllegalArgumentException("operatorId must not be blank");
        }
        if (now == null) {
            throw new IllegalArgumentException("now must not be null");
        }
        return new WorkOrder(id, equipmentId, fieldId, operatorId,
                WorkOrderStatus.PENDING, now, now, null);
    }

    public static WorkOrder rehydrate(
            String id,
            String equipmentId,
            String fieldId,
            String operatorId,
            WorkOrderStatus status,
            Instant createdAt,
            Instant updatedAt,
            String operatorNotes) {
        return new WorkOrder(id, equipmentId, fieldId, operatorId, status,
                createdAt, updatedAt, operatorNotes);
    }

    public WorkOrder withStatus(WorkOrderStatus nextStatus, String notes, Instant now) {
        if (!status.canTransitionTo(nextStatus)) {
            throw new IllegalStateException(
                    "Invalid transition: " + status + " -> " + nextStatus);
        }
        return new WorkOrder(id, equipmentId, fieldId, operatorId, nextStatus,
                createdAt, now, notes);
    }

    public String id() { return id; }
    public String equipmentId() { return equipmentId; }
    public String fieldId() { return fieldId; }
    public String operatorId() { return operatorId; }
    public WorkOrderStatus status() { return status; }
    public Instant createdAt() { return createdAt; }
    public Instant updatedAt() { return updatedAt; }
    public String operatorNotes() { return operatorNotes; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof WorkOrder w)) return false;
        return id.equals(w.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
