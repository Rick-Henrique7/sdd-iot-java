package com.johndeere.agrio.operations.adapters.dto;

import com.johndeere.agrio.operations.domain.model.DowntimeReason;
import com.johndeere.agrio.operations.domain.model.DowntimeRecord;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record DowntimeDTO(
        String id,
        @NotBlank String equipmentId,
        @NotBlank String operatorId,
        @NotNull DowntimeReason reason,
        @NotNull Instant startTime,
        Instant endTime,
        String comments) {

    public static DowntimeDTO fromDomain(DowntimeRecord r) {
        return new DowntimeDTO(
                r.id(), r.equipmentId(), r.operatorId(), r.reason(),
                r.startTime(), r.endTime(), r.comments());
    }
}
