package com.johndeere.agrio.telemetry.usecase;

import com.johndeere.agrio.telemetry.domain.model.GpsCoordinates;
import com.johndeere.agrio.telemetry.domain.model.TelemetryMetrics;
import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import com.johndeere.agrio.telemetry.infrastructure.kafka.TelemetryProducer;
import com.johndeere.agrio.telemetry.infrastructure.persistence.TelemetryEntity;
import com.johndeere.agrio.telemetry.infrastructure.persistence.TelemetryJpaRepository;
import com.johndeere.agrio.telemetry.infrastructure.redis.LatestStateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class ProcessTelemetryUseCaseTest {

    private LatestStateRepository redis;
    private TelemetryJpaRepository repository;
    private TelemetryProducer producer;
    private ProcessTelemetryUseCase useCase;

    @BeforeEach
    void setUp() {
        redis = mock(LatestStateRepository.class);
        repository = mock(TelemetryJpaRepository.class);
        producer = mock(TelemetryProducer.class);
        useCase = new ProcessTelemetryUseCase(redis, repository, producer);
    }

    @Test
    @DisplayName("Deve gravar no Redis, no Postgres e repassar ao producer de Kafka")
    void shouldFanOutToAllSinks() {
        TelemetryPayload payload = samplePayload("TRAC-01");

        useCase.execute(payload);

        verify(redis, times(1)).saveState("TRAC-01", payload);
        verify(repository, times(1)).save(anyEntity());
        verify(producer, times(1)).sendProcessedTelemetry(payload);
    }

    @Test
    @DisplayName("Falha em uma das sinks NAO deve impedir as outras (modo degradado)")
    void shouldKeepRunningWhenOneSinkFails() {
        TelemetryPayload payload = samplePayload("TRAC-02");
        doThrow(new RuntimeException("redis down"))
                .when(redis).saveState("TRAC-02", payload);

        useCase.execute(payload);

        // Redis attempted, but Postgres and Kafka still ran.
        verify(redis, times(1)).saveState("TRAC-02", payload);
        verify(repository, times(1)).save(anyEntity());
        verify(producer, times(1)).sendProcessedTelemetry(payload);
    }

    @Test
    @DisplayName("A entidade persistida deve ter o equipmentId, timestamp e metricas corretas")
    void shouldPersistEntityWithCorrectFields() {
        TelemetryPayload payload = samplePayload("TRAC-03");
        ArgumentCaptor<TelemetryEntity> captor = ArgumentCaptor.forClass(TelemetryEntity.class);

        useCase.execute(payload);

        verify(repository).save(captor.capture());
        TelemetryEntity saved = captor.getValue();
        assertThat(saved.getEquipmentId()).isEqualTo("TRAC-03");
        assertThat(saved.getEngineTemp()).isEqualTo(92.5);
        assertThat(saved.getRpm()).isEqualTo(2200);
        assertThat(saved.getLatitude()).isEqualTo(-21.1704);
        assertThat(saved.getLongitude()).isEqualTo(-47.8103);
    }

    private static TelemetryPayload samplePayload(String equipmentId) {
        return new TelemetryPayload(
                equipmentId,
                Instant.parse("2026-08-15T12:00:00Z"),
                new GpsCoordinates(-21.1704, -47.8103),
                new TelemetryMetrics(92.5, 2200, 78.3, 14.2)
        );
    }

    private static TelemetryEntity anyEntity() {
        return org.mockito.ArgumentMatchers.any(TelemetryEntity.class);
    }
}
