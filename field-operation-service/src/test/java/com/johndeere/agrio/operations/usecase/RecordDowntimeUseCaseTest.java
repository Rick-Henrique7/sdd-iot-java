package com.johndeere.agrio.operations.usecase;

import com.johndeere.agrio.operations.domain.model.DowntimeReason;
import com.johndeere.agrio.operations.domain.model.DowntimeRecord;
import com.johndeere.agrio.operations.domain.service.OperationDomainService;
import com.johndeere.agrio.operations.infrastructure.messaging.OperationEventPublisher;
import com.johndeere.agrio.operations.infrastructure.persistence.DowntimeEntity;
import com.johndeere.agrio.operations.infrastructure.persistence.DowntimeJpaRepository;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RecordDowntimeUseCaseTest {

    @Test
    void recordsOpenDowntime() {
        var repo = mock(DowntimeJpaRepository.class);
        var publisher = mock(OperationEventPublisher.class);
        var domainService = new OperationDomainService();
        var start = Instant.parse("2026-08-16T12:00:00Z");
        var clock = Clock.fixed(start, ZoneOffset.UTC);
        var useCase = new RecordDowntimeUseCase(domainService, repo, publisher, clock);

        var record = useCase.execute("TRAC-1", "OP-1", DowntimeReason.REFUELING, start, "ok");

        assertTrue(record.isOpen());
        assertEquals(DowntimeReason.REFUELING, record.reason());
        assertTrue(record.id().startsWith("DT-"));
        // Open record: duration computed against the clock-supplied "now"
        assertEquals(Duration.ZERO, record.durationAt(start));
        verify(repo, times(1)).save(any(DowntimeEntity.class));
        verify(publisher, times(1)).publishDowntimeRecorded(record);
    }

    @Test
    void closedDowntimeHasDuration() {
        var repo = mock(DowntimeJpaRepository.class);
        var publisher = mock(OperationEventPublisher.class);
        var start = Instant.parse("2026-08-16T12:00:00Z");
        var end = start.plusSeconds(1800);
        var clock = Clock.fixed(end, ZoneOffset.UTC);
        var useCase = new RecordDowntimeUseCase(
                new OperationDomainService(), repo, publisher, clock);

        var record = useCase.execute("TRAC-1", "OP-1", DowntimeReason.MEAL_BREAK, start, null);
        var closed = record.close(end);
        assertEquals(Duration.ofMinutes(30), closed.duration());
    }
}
