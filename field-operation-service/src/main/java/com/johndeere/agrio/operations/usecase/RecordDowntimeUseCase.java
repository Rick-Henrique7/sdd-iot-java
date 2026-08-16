package com.johndeere.agrio.operations.usecase;

import com.johndeere.agrio.operations.domain.model.DowntimeReason;
import com.johndeere.agrio.operations.domain.model.DowntimeRecord;
import com.johndeere.agrio.operations.domain.service.OperationDomainService;
import com.johndeere.agrio.operations.infrastructure.messaging.OperationEventPublisher;
import com.johndeere.agrio.operations.infrastructure.persistence.DowntimeEntity;
import com.johndeere.agrio.operations.infrastructure.persistence.DowntimeJpaRepository;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/**
 * Use case: record a new downtime event (operator presses the button).
 *
 * <p>Flow:
 * <ol>
 *   <li>Domain service validates and builds the aggregate.</li>
 *   <li>JPA repository persists it (with {@code end_time = null}).</li>
 *   <li>Kafka event {@code DOWNTIME_RECORDED} is published (best-effort).</li>
 * </ol>
 */
@Service
public class RecordDowntimeUseCase {

    private final OperationDomainService domainService;
    private final DowntimeJpaRepository repository;
    private final OperationEventPublisher publisher;
    private final Clock clock;

    public RecordDowntimeUseCase(
            OperationDomainService domainService,
            DowntimeJpaRepository repository,
            OperationEventPublisher publisher,
            Clock clock) {
        this.domainService = domainService;
        this.repository = repository;
        this.publisher = publisher;
        this.clock = clock;
    }

    public DowntimeRecord execute(
            String equipmentId,
            String operatorId,
            DowntimeReason reason,
            Instant startTime,
            String comments) {
        String id = "DT-" + UUID.randomUUID();
        var record = domainService.recordDowntime(id, equipmentId, operatorId, reason, startTime, comments);
        repository.save(DowntimeEntity.fromDomain(record));
        publisher.publishDowntimeRecorded(record);
        return record;
    }
}
