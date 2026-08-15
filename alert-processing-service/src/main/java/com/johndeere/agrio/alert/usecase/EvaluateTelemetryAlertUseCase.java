package com.johndeere.agrio.alert.usecase;

import com.johndeere.agrio.alert.adapters.dto.AlertDTO;
import com.johndeere.agrio.alert.domain.model.Alert;
import com.johndeere.agrio.alert.domain.model.TelemetryData;
import com.johndeere.agrio.alert.domain.service.AlertEvaluatorService;
import com.johndeere.agrio.alert.infrastructure.persistence.AlertEntity;
import com.johndeere.agrio.alert.infrastructure.persistence.AlertEntityMapper;
import com.johndeere.agrio.alert.infrastructure.persistence.AlertJpaRepository;
import com.johndeere.agrio.alert.infrastructure.websocket.AlertWebSocketPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Drives a single telemetry sample through the rule engine and,
 * when an alert is fired, persists it AND publishes it on the
 * WebSocket. Each side-effect is independent: a Postgres outage
 * does not block the WebSocket publish and vice versa.
 */
@Service
public class EvaluateTelemetryAlertUseCase {

    private static final Logger log = LoggerFactory.getLogger(EvaluateTelemetryAlertUseCase.class);

    private final AlertEvaluatorService evaluator;
    private final AlertEntityMapper mapper;
    private final AlertJpaRepository repository;
    private final AlertWebSocketPublisher publisher;

    public EvaluateTelemetryAlertUseCase(AlertEvaluatorService evaluator,
                                         AlertEntityMapper mapper,
                                         AlertJpaRepository repository,
                                         AlertWebSocketPublisher publisher) {
        this.evaluator = evaluator;
        this.mapper = mapper;
        this.repository = repository;
        this.publisher = publisher;
    }

    public Optional<Alert> execute(TelemetryData telemetry) {
        Optional<Alert> result = evaluator.evaluate(telemetry);
        if (result.isEmpty()) {
            return result;
        }

        Alert alert = result.get();
        log.info("Alert fired: id={} equipment={} severity={} metric={} value={}",
                alert.getId(), alert.getEquipmentId(), alert.getSeverity(),
                alert.getMetricName(), alert.getCurrentValue());

        // 1) Persist (best-effort)
        try {
            AlertEntity entity = mapper.toEntity(alert);
            repository.save(entity);
        } catch (Exception ex) {
            log.warn("Postgres persist failed for alert={} (continuing): {}",
                    alert.getId(), ex.getMessage(), ex);
        }

        // 2) WebSocket publish (best-effort)
        try {
            publisher.publishAlert(AlertDTO.fromDomain(alert));
        } catch (Exception ex) {
            log.warn("WebSocket publish failed for alert={} (continuing): {}",
                    alert.getId(), ex.getMessage(), ex);
        }

        return result;
    }
}
