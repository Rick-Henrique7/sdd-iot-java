package com.johndeere.agrio.fleet.usecase;

import com.johndeere.agrio.fleet.adapters.dto.EquipmentDTO;
import com.johndeere.agrio.fleet.infrastructure.persistence.EntityMappers;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentEntity;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentJpaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Returns the entire fleet ordered by {@code id} for stable
 * pagination. No filters in this change — a future change adds
 * status, type, and free-text search.
 */
@Service
public class ListFleetUseCase {

    private final EquipmentJpaRepository repository;
    private final EntityMappers mappers;

    public ListFleetUseCase(EquipmentJpaRepository repository,
                            EntityMappers mappers) {
        this.repository = repository;
        this.mappers = mappers;
    }

    public List<EquipmentDTO> execute() {
        return repository.findAll(Sort.by("id"))
                .stream()
                .map(mappers::toDomain)
                .map(mappers::toDto)
                .toList();
    }
}
