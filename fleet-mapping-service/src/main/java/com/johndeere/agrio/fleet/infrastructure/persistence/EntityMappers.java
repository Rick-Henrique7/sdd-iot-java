package com.johndeere.agrio.fleet.infrastructure.persistence;

import com.johndeere.agrio.fleet.adapters.dto.EquipmentDTO;
import com.johndeere.agrio.fleet.domain.model.Equipment;
import com.johndeere.agrio.fleet.domain.model.EquipmentStatus;
import com.johndeere.agrio.fleet.domain.model.EquipmentType;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Domain ↔ JPA ↔ DTO mapping for {@link Equipment}.
 * Lives in infrastructure so the domain layer never imports
 * JPA classes and the controller never imports JPA classes.
 */
@Component
public class EntityMappers {

    public Equipment toDomain(EquipmentEntity entity) {
        return new Equipment(
                entity.getId(),
                entity.getName(),
                entity.getModel(),
                entity.getSerialNumber(),
                EquipmentType.valueOf(entity.getType()),
                EquipmentStatus.valueOf(entity.getStatus()),
                entity.getHorometerHours(),
                entity.getLastMaintenanceDate()
        );
    }

    public EquipmentEntity toEntity(Equipment domain) {
        return new EquipmentEntity(
                domain.getId(),
                domain.getName(),
                domain.getModel(),
                domain.getSerialNumber(),
                domain.getType().name(),
                domain.getStatus().name(),
                domain.getHorometerHours(),
                domain.getLastMaintenanceDate()
        );
    }

    public EquipmentDTO toDto(Equipment domain) {
        // DTO exposes the date as ISO-8601 string (wire-friendly)
        // while the domain keeps it as LocalDate.
        String lastMaintenance = domain.getLastMaintenanceDate() == null
                ? null
                : domain.getLastMaintenanceDate().toString();

        return new EquipmentDTO(
                domain.getId(),
                domain.getName(),
                domain.getModel(),
                domain.getSerialNumber(),
                domain.getType(),
                domain.getStatus(),
                domain.getHorometerHours(),
                lastMaintenance
        );
    }

    public Equipment toDomain(EquipmentDTO dto) {
        // Extract the date to a local so the compiler can infer
        // the ternary type (null vs LocalDate) cleanly.
        LocalDate lastMaintenance = (dto.lastMaintenanceDate() == null
                || dto.lastMaintenanceDate().isBlank())
                ? null
                : LocalDate.parse(dto.lastMaintenanceDate());

        return new Equipment(
                dto.id(),
                dto.name(),
                dto.model(),
                dto.serialNumber(),
                dto.type(),
                dto.status(),
                dto.horometerHours(),
                lastMaintenance
        );
    }
}
