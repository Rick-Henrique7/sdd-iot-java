package com.johndeere.agrio.telemetry.usecase;

import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import com.johndeere.agrio.telemetry.infrastructure.kafka.TelemetryProducer;
import com.johndeere.agrio.telemetry.infrastructure.persistence.TelemetryEntity;
import com.johndeere.agrio.telemetry.infrastructure.persistence.TelemetryJpaRepository;
import com.johndeere.agrio.telemetry.infrastructure.redis.LatestStateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Processes a single telemetry event. The use case writes the
 * latest state to Redis, persists the historical row to PostgreSQL
 * (via JPA), and republishes the payload to the processed topic.
 *
 * <p>Each side-effect is best-effort and independent: if Redis is
 * down, the SQL + Kafka path still runs (degraded mode), and vice
 * versa. This matches the contract in
 * {@code changes/003-telemetry-ingestion-service/spec.md §3}.</p>
 */
@Service
public class ProcessTelemetryUseCase {

    private static final Logger log = LoggerFactory.getLogger(ProcessTelemetryUseCase.class);

    private final LatestStateRepository latestStateRepository;
    private final TelemetryJpaRepository telemetryRepository;
    private final TelemetryProducer telemetryProducer;

    public ProcessTelemetryUseCase(LatestStateRepository latestStateRepository,
                                   TelemetryJpaRepository telemetryRepository,
                                   TelemetryProducer telemetryProducer) {
        this.latestStateRepository = latestStateRepository;
        this.telemetryRepository = telemetryRepository;
        this.telemetryProducer = telemetryProducer;
    }

    public void execute(TelemetryPayload payload) {
        log.info("Processing telemetry for equipment={} ts={}",
                payload.getEquipmentId(), payload.getTimestamp());

        // 1) Redis latest-state (O(1))
        try {
            latestStateRepository.saveState(payload.getEquipmentId(), payload);
            log.info("Redis latest-state written for equipment={}", payload.getEquipmentId());
        } catch (Exception ex) {
            log.warn("Redis latest-state update failed for equipment={} (continuing): {}",
                    payload.getEquipmentId(), ex.getMessage(), ex);
        }

        // 2) Postgres history
        try {
            TelemetryEntity entity = new TelemetryEntity(
                    payload.getEquipmentId(),
                    payload.getTimestamp(),
                    payload.getGps().getLatitude(),
                    payload.getGps().getLongitude(),
                    payload.getMetrics().getEngineTemp(),
                    payload.getMetrics().getRpm(),
                    payload.getMetrics().getFuelLevel(),
                    payload.getMetrics().getSpeed(),
                    Instant.now()
            );
            telemetryRepository.save(entity);
            log.info("Postgres history written for equipment={}", payload.getEquipmentId());
        } catch (Exception ex) {
            log.warn("Postgres persist failed for equipment={} (continuing): {}",
                    payload.getEquipmentId(), ex.getMessage(), ex);
        }

        // 3) Kafka processed topic
        try {
            telemetryProducer.sendProcessedTelemetry(payload);
            log.info("Kafka processed topic produced for equipment={}", payload.getEquipmentId());
        } catch (Exception ex) {
            log.warn("Kafka producer failed for equipment={} (continuing): {}",
                    payload.getEquipmentId(), ex.getMessage(), ex);
        }
    }
}
