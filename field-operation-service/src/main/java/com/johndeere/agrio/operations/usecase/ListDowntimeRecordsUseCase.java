package com.johndeere.agrio.operations.usecase;

import com.johndeere.agrio.operations.domain.model.DowntimeRecord;
import com.johndeere.agrio.operations.infrastructure.persistence.DowntimeEntity;
import com.johndeere.agrio.operations.infrastructure.persistence.DowntimeJpaRepository;
import com.johndeere.agrio.operations.infrastructure.persistence.EntityMappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ListDowntimeRecordsUseCase {

    private final DowntimeJpaRepository repository;
    private final EntityMappers mappers;

    public ListDowntimeRecordsUseCase(DowntimeJpaRepository repository, EntityMappers mappers) {
        this.repository = repository;
        this.mappers = mappers;
    }

    public Page<DowntimeRecord> execute(String equipmentId, Pageable pageable) {
        Page<DowntimeEntity> page = (equipmentId != null && !equipmentId.isBlank())
            ? repository.findByEquipmentId(equipmentId, pageable)
            : repository.findAllByOrderByStartTimeDesc(pageable);
        return page.map(mappers::toDomain);
    }
}
