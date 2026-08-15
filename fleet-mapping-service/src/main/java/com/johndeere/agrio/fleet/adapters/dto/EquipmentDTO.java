package com.johndeere.agrio.fleet.adapters.dto;

import com.johndeere.agrio.fleet.domain.model.EquipmentStatus;
import com.johndeere.agrio.fleet.domain.model.EquipmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Wire contract for the fleet endpoints. The {@code id} is
 * caller-supplied (no id generation in this change).
 */
public record EquipmentDTO(
        @NotBlank @Size(max = 64)  String id,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 64)  String model,
        @NotBlank @Size(max = 64)  String serialNumber,
        @NotNull                   EquipmentType type,
        @NotNull                   EquipmentStatus status,
        @PositiveOrZero            Double horometerHours,
        @Size(max = 10)            String lastMaintenanceDate
) { }
