package com.johndeere.agrio.operations.adapters.dto;

import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

/**
 * Request/response DTO for {@code /api/v1/operations/work-orders}.
 *
 * <p>Jackson-bound. Lives in the {@code adapters} layer because it carries
 * {@code @NotBlank} from Bean Validation. {@code status} is intentionally
 * not validated as {@code @NotNull} because in the create request the
 * server always assigns {@code PENDING}; the field is set on the way back.
 */
public record WorkOrderDTO(
        String id,
        @NotBlank String equipmentId,
        String fieldId,
        @NotBlank String operatorId,
        WorkOrderStatus status,
        Instant createdAt,
        Instant updatedAt,
        String operatorNotes) {

    public static WorkOrderDTO fromDomain(WorkOrder w) {
        return new WorkOrderDTO(
                w.id(), w.equipmentId(), w.fieldId(), w.operatorId(),
                w.status(), w.createdAt(), w.updatedAt(), w.operatorNotes());
    }
}
