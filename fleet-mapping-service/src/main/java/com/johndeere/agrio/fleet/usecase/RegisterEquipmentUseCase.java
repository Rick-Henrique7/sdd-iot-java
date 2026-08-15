package com.johndeere.agrio.fleet.usecase;

import com.johndeere.agrio.fleet.adapters.dto.EquipmentDTO;
import com.johndeere.agrio.fleet.domain.model.Equipment;
import com.johndeere.agrio.fleet.infrastructure.persistence.EntityMappers;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentEntity;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentJpaRepository;
import org.springframework.stereotype.Service;

/**
 * Persists a new piece of equipment. The {@code id} is
 * caller-supplied (the api-gateway + front-end own the namespace
 * convention, e.g. {@code TRAC-7230J-001}).
 */
@Service
public class RegisterEquipmentUseCase {

    private final EquipmentJpaRepository repository;
    private final EntityMappers mappers;

    public RegisterEquipmentUseCase(EquipmentJpaRepository repository,
                                   EntityMappers mappers) {
        this.repository = repository;
        this.mappers = mappers;
    }

    public EquipmentDTO execute(EquipmentDTO dto) {
        Equipment domain = mappers.toDomain(dto);
        EquipmentEntity entity = mappers.toEntity(domain);
        EquipmentEntity saved = repository.save(entity);
        return mappers.toDto(mappers.toDomain(saved));
    }
}
