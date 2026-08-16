package com.johndeere.agrio.operations.domain.model;

/**
 * Lifecycle states for a {@link WorkOrder}.
 *
 * <p>Allowed transitions are encoded in {@link #canTransitionTo(WorkOrderStatus)}
 * and enforced by {@code OperationDomainService}.
 */
public enum WorkOrderStatus {

    PENDING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED;

    /**
     * Returns true when transitioning to {@code next} is allowed.
     *
     * <p>Rules:
     * <ul>
     *   <li>{@code PENDING} -> {@code IN_PROGRESS} | {@code CANCELLED}</li>
     *   <li>{@code IN_PROGRESS} -> {@code COMPLETED} | {@code CANCELLED}</li>
     *   <li>{@code COMPLETED}, {@code CANCELLED} are terminal</li>
     * </ul>
     */
    public boolean canTransitionTo(WorkOrderStatus next) {
        if (next == null) {
            return false;
        }
        return switch (this) {
            case PENDING -> next == IN_PROGRESS || next == CANCELLED;
            case IN_PROGRESS -> next == COMPLETED || next == CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };
    }
}
