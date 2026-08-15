package com.johndeere.agrio.alert.infrastructure.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.alert.domain.model.TelemetryData;
import com.johndeere.agrio.alert.usecase.EvaluateTelemetryAlertUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Subscribes to {@code agri.telemetry.processed}, deserialises the
 * payload into a {@link TelemetryMessage}, maps it to the domain
 * {@link TelemetryData} and hands it to
 * {@link EvaluateTelemetryAlertUseCase}.
 *
 * <p>Malformed JSON is logged and the message is committed (the
 * consumer does not retry forever; a future change adds a DLQ).</p>
 */
@Component
public class ProcessedTelemetryConsumer {

    private static final Logger log = LoggerFactory.getLogger(ProcessedTelemetryConsumer.class);

    private final ObjectMapper objectMapper;
    private final EvaluateTelemetryAlertUseCase useCase;

    public ProcessedTelemetryConsumer(ObjectMapper objectMapper,
                                      EvaluateTelemetryAlertUseCase useCase) {
        this.objectMapper = objectMapper;
        this.useCase = useCase;
    }

    @KafkaListener(topics = "agri.telemetry.processed", groupId = "alert-processing-group")
    public void consume(String message) {
        TelemetryMessage envelope;
        try {
            envelope = objectMapper.readValue(message, TelemetryMessage.class);
        } catch (JsonProcessingException ex) {
            log.error("Malformed telemetry envelope, skipping: {}", ex.getMessage());
            return;
        }

        if (envelope.metrics() == null) {
            log.error("Telemetry envelope missing 'metrics' field, skipping");
            return;
        }

        TelemetryData data = new TelemetryData(
                envelope.equipmentId(),
                envelope.timestamp(),
                envelope.metrics().engineTemp(),
                envelope.metrics().rpm(),
                envelope.metrics().fuelLevel(),
                envelope.metrics().speed()
        );
        useCase.execute(data);
    }
}
