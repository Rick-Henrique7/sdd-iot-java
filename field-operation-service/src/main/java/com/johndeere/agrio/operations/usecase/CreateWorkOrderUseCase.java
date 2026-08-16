package com.johndeere.agrio.operations.usecase;

import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.domain.service.OperationDomainService;
import com.johndeere.agrio.operations.infrastructure.messaging.OperationEventPublisher;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderEntity;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderJpaRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.UUID;

/**
 * Use case: create a new WorkOrder in PENDING state.
 *
 * <p>Flow:
 * <ol>
 *   <li>Domain service builds the aggregate (id = UUID, status = PENDING).</li>
 *   <li>JPA repository persists it.</li>
 *   <li>Kafka event {@code WORK_ORDER_CREATED} is published (best-effort).</li>
 * </ol>
 */
@Service
public class CreateWorkOrderUseCase {

    private final OperationDomainService domainService;
    private final WorkOrderJpaRepository repository;
    private final OperationEventPublisher publisher;
    private final Clock clock;

    public CreateWorkOrderUseCase(
            OperationDomainService domainService,
            WorkOrderJpaRepository repository,
            OperationEventPublisher publisher,
            Clock clock) {
        this.domainService = domainService;
        this.repository = repository;
        this.publisher = publisher;
        this.clock = clock;
    }

    public WorkOrder execute(String equipmentId, String fieldId, String operatorId) {
        String id = "WO-" + UUID.randomUUID();
        var now = clock.instant();
        var wo = domainService.createWorkOrder(id, equipmentId, fieldId, operatorId, now);
        repository.save(WorkOrderEntity.fromDomain(wo));
        publisher.publishWorkOrderCreated(wo);
        return wo;
    }
}
