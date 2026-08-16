package com.johndeere.agrio.operations.usecase;

import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import com.johndeere.agrio.operations.infrastructure.persistence.EntityMappers;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderEntity;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ListWorkOrdersUseCase {

    private final WorkOrderJpaRepository repository;
    private final EntityMappers mappers;

    public ListWorkOrdersUseCase(WorkOrderJpaRepository repository, EntityMappers mappers) {
        this.repository = repository;
        this.mappers = mappers;
    }

    public Page<WorkOrder> execute(WorkOrderStatus status, String equipmentId, Pageable pageable) {
        Page<WorkOrderEntity> page;
        if (status != null && equipmentId != null) {
            page = repository.findByStatusAndEquipmentId(status, equipmentId, pageable);
        } else if (status != null) {
            page = repository.findByStatus(status, pageable);
        } else if (equipmentId != null) {
            page = repository.findByEquipmentId(equipmentId, pageable);
        } else {
            page = repository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(mappers::toDomain);
    }
}
