package com.johndeere.agrio.telemetry.infrastructure.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import com.johndeere.agrio.telemetry.usecase.ProcessTelemetryUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Subscribes to {@code agri.telemetry.raw} and hands each message
 * to {@link ProcessTelemetryUseCase}. Malformed JSON is logged and
 * the message is re-thrown so Kafka applies its default redelivery
 * policy (and eventually skips the offset once the error policy
 * decides so). A future change introduces a proper DLQ.
 */
@Component
public class TelemetryConsumer {

    private static final Logger log = LoggerFactory.getLogger(TelemetryConsumer.class);

    private final ProcessTelemetryUseCase processTelemetryUseCase;
    private final ObjectMapper objectMapper;

    public TelemetryConsumer(ProcessTelemetryUseCase processTelemetryUseCase,
                             ObjectMapper objectMapper) {
        this.processTelemetryUseCase = processTelemetryUseCase;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "agri.telemetry.raw", groupId = "telemetry-ingestion-group")
    public void consume(String message) {
        TelemetryPayload payload;
        try {
            payload = objectMapper.readValue(message, TelemetryPayload.class);
        } catch (JsonProcessingException ex) {
            log.error("Malformed telemetry payload, skipping: {}", ex.getMessage());
            return; // commit the offset; do not re-deliver forever
        }
        processTelemetryUseCase.execute(payload);
    }
}
