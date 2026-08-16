package com.johndeere.agrio.operations.usecase;

import com.johndeere.agrio.operations.domain.exception.WorkOrderNotFoundException;
import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.infrastructure.persistence.EntityMappers;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderEntity;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderJpaRepository;
import org.springframework.stereotype.Service;

@Service
public class GetWorkOrderByIdUseCase {

    private final WorkOrderJpaRepository repository;
    private final EntityMappers mappers;

    public GetWorkOrderByIdUseCase(WorkOrderJpaRepository repository, EntityMappers mappers) {
        this.repository = repository;
        this.mappers = mappers;
    }

    public WorkOrder execute(String id) {
        WorkOrderEntity entity = repository.findById(id)
            .orElseThrow(() -> new WorkOrderNotFoundException(id));
        return mappers.toDomain(entity);
    }
}
