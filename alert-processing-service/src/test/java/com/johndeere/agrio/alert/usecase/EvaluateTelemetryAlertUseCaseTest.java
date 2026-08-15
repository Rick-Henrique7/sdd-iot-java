package com.johndeere.agrio.alert.usecase;

import com.johndeere.agrio.alert.adapters.dto.AlertDTO;
import com.johndeere.agrio.alert.domain.model.Alert;
import com.johndeere.agrio.alert.domain.model.AlertSeverity;
import com.johndeere.agrio.alert.domain.model.TelemetryData;
import com.johndeere.agrio.alert.domain.service.AlertEvaluatorService;
import com.johndeere.agrio.alert.infrastructure.persistence.AlertEntity;
import com.johndeere.agrio.alert.infrastructure.persistence.AlertEntityMapper;
import com.johndeere.agrio.alert.infrastructure.persistence.AlertJpaRepository;
import com.johndeere.agrio.alert.infrastructure.websocket.AlertWebSocketPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EvaluateTelemetryAlertUseCaseTest {

    private AlertEvaluatorService evaluator;
    private AlertEntityMapper mapper;
    private AlertJpaRepository repository;
    private AlertWebSocketPublisher publisher;
    private EvaluateTelemetryAlertUseCase useCase;

    @BeforeEach
    void setUp() {
        evaluator = mock(AlertEvaluatorService.class);
        mapper    = new AlertEntityMapper();
        repository = mock(AlertJpaRepository.class);
        publisher = mock(AlertWebSocketPublisher.class);
        useCase = new EvaluateTelemetryAlertUseCase(evaluator, mapper, repository, publisher);
    }

    @Test
    @DisplayName("Persiste e publica quando o avaliador devolve um alerta")
    void shouldPersistAndPublishWhenAlertFires() {
        TelemetryData t = new TelemetryData("TRAC-01", Instant.now(), 99.0, 2000.0, 50.0, 10.0);
        Alert alert = new Alert(
                "ALT-1", "TRAC-01", AlertSeverity.CRITICAL,
                "engineTemp", 99.0, 95.0,
                "msg", Instant.parse("2026-08-15T18:00:00Z"));
        when(evaluator.evaluate(t)).thenReturn(Optional.of(alert));

        Optional<Alert> result = useCase.execute(t);

        assertThat(result).contains(alert);
        verify(repository).save(any(AlertEntity.class));
        verify(publisher).publishAlert(any(AlertDTO.class));
    }

    @Test
    @DisplayName("NEM persiste NEM publica quando nao ha alerta")
    void shouldNotPersistNorPublishWhenNoAlert() {
        TelemetryData t = new TelemetryData("TRAC-02", Instant.now(), 88.0, 2000.0, 50.0, 10.0);
        when(evaluator.evaluate(t)).thenReturn(Optional.empty());

        Optional<Alert> result = useCase.execute(t);

        assertThat(result).isEmpty();
        verify(repository, never()).save(any(AlertEntity.class));
        verify(publisher, never()).publishAlert(any(AlertDTO.class));
    }

    @Test
    @DisplayName("Falha no Postgres NAO impede a publicacao via WebSocket (degraded mode)")
    void shouldKeepPublishingWhenPostgresFails() {
        TelemetryData t = new TelemetryData("TRAC-03", Instant.now(), 99.0, 2000.0, 50.0, 10.0);
        Alert alert = new Alert(
                "ALT-2", "TRAC-03", AlertSeverity.CRITICAL,
                "engineTemp", 99.0, 95.0,
                "msg", Instant.now());
        when(evaluator.evaluate(t)).thenReturn(Optional.of(alert));
        doThrow(new RuntimeException("postgres down"))
                .when(repository).save(any(AlertEntity.class));

        useCase.execute(t);

        verify(repository).save(any(AlertEntity.class));
        verify(publisher).publishAlert(any(AlertDTO.class));
    }

    @Test
    @DisplayName("A entidade persistida reflete os campos do alerta de dominio")
    void shouldMapDomainToEntityCorrectly() {
        TelemetryData t = new TelemetryData("TRAC-04", Instant.now(), 99.0, 2000.0, 50.0, 10.0);
        Alert alert = new Alert(
                "ALT-3", "TRAC-04", AlertSeverity.CRITICAL,
                "engineTemp", 99.0, 95.0,
                "Critical temp", Instant.parse("2026-08-15T18:00:00Z"));
        when(evaluator.evaluate(t)).thenReturn(Optional.of(alert));

        ArgumentCaptor<AlertEntity> captor = ArgumentCaptor.forClass(AlertEntity.class);

        useCase.execute(t);

        verify(repository).save(captor.capture());
        AlertEntity saved = captor.getValue();
        assertThat(saved.getId()).isEqualTo("ALT-3");
        assertThat(saved.getSeverity()).isEqualTo("CRITICAL");
        assertThat(saved.getCurrentValue()).isEqualTo(99.0);
    }
}
