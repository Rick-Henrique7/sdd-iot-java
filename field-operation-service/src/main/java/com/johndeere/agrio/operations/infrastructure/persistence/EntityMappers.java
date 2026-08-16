package com.johndeere.agrio.operations.infrastructure.persistence;

import com.johndeere.agrio.operations.domain.model.DowntimeRecord;
import com.johndeere.agrio.operations.domain.model.WorkOrder;
import org.springframework.stereotype.Component;

/**
 * Domain \u2194 JPA mapper (Change 022).
 * Centralizes `toDomain` for both WorkOrder and Downtime,
 * keeping use cases free of JPA imports.
 */
@Component
public class EntityMappers {

    public WorkOrder toDomain(WorkOrderEntity entity) {
        return entity.toDomain();
    }

    public DowntimeRecord toDomain(DowntimeEntity entity) {
        return entity.toDomain();
    }
}
