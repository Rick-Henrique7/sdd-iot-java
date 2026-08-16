package com.johndeere.agrio.operations.usecase;

import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import com.johndeere.agrio.operations.domain.service.OperationDomainService;
import com.johndeere.agrio.operations.infrastructure.messaging.OperationEventPublisher;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderEntity;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.NoSuchElementException;

/**
 * Use case: operator changes the status of an existing WorkOrder
 * (e.g. PENDING -> IN_PROGRESS, IN_PROGRESS -> COMPLETED).
 *
 * <p>Flow:
 * <ol>
 *   <li>Look up the WorkOrder by id; throw if not found.</li>
 *   <li>Domain service validates the transition.</li>
 *   <li>JPA repository persists the updated aggregate.</li>
 *   <li>Kafka event {@code WORK_ORDER_STATUS_CHANGED} is published.</li>
 * </ol>
 */
@Service
public class UpdateWorkOrderStatusUseCase {

    private final OperationDomainService domainService;
    private final WorkOrderJpaRepository repository;
    private final OperationEventPublisher publisher;
    private final Clock clock;

    public UpdateWorkOrderStatusUseCase(
            OperationDomainService domainService,
            WorkOrderJpaRepository repository,
            OperationEventPublisher publisher,
            Clock clock) {
        this.domainService = domainService;
        this.repository = repository;
        this.publisher = publisher;
        this.clock = clock;
    }

    @Transactional
    public WorkOrder execute(String id, WorkOrderStatus nextStatus, String notes) {
        var entity = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("WorkOrder not found: " + id));
        var current = entity.toDomain();
        var updated = domainService.updateStatus(current, nextStatus, notes, clock.instant());
        repository.save(WorkOrderEntity.fromDomain(updated));
        publisher.publishWorkOrderStatusChanged(updated, current.status());
        return updated;
    }
}
