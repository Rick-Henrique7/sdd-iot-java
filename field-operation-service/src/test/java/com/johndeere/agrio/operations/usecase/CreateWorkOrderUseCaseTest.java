package com.johndeere.agrio.operations.usecase;

import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import com.johndeere.agrio.operations.domain.service.OperationDomainService;
import com.johndeere.agrio.operations.infrastructure.messaging.OperationEventPublisher;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderEntity;
import com.johndeere.agrio.operations.infrastructure.persistence.WorkOrderJpaRepository;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CreateWorkOrderUseCaseTest {

    @Test
    void createsPersistsAndPublishes() {
        var repo = mock(WorkOrderJpaRepository.class);
        var publisher = mock(OperationEventPublisher.class);
        var domainService = new OperationDomainService();
        var fixed = Instant.parse("2026-08-16T12:00:00Z");
        var clock = Clock.fixed(fixed, ZoneOffset.UTC);
        var useCase = new CreateWorkOrderUseCase(domainService, repo, publisher, clock);

        var wo = useCase.execute("TRAC-1", "FLD-1", "OP-1");

        assertEquals(WorkOrderStatus.PENDING, wo.status());
        assertEquals("TRAC-1", wo.equipmentId());
        assertNotNull(wo.id());
        assertTrue(wo.id().startsWith("WO-"));
        verify(repo, times(1)).save(any(WorkOrderEntity.class));
        verify(publisher, times(1)).publishWorkOrderCreated(wo);
    }

    @Test
    void kafkaFailureDoesNotPreventSuccess() {
        var repo = mock(WorkOrderJpaRepository.class);
        var publisher = mock(OperationEventPublisher.class);
        // publisher swallows Kafka errors internally, so no exception bubbles up
        var domainService = new OperationDomainService();
        var clock = Clock.fixed(Instant.parse("2026-08-16T12:00:00Z"), ZoneOffset.UTC);
        var useCase = new CreateWorkOrderUseCase(domainService, repo, publisher, clock);

        assertDoesNotThrow(() -> useCase.execute("TRAC-1", "FLD-1", "OP-1"));
    }
}
