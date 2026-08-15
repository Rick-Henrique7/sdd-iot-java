package com.johndeere.agrio.alert.infrastructure.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.alert.domain.model.TelemetryData;
import com.johndeere.agrio.alert.usecase.EvaluateTelemetryAlertUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Subscribes to {@code agri.telemetry.processed}, deserialises the
 * payload into a {@link TelemetryMessage}, maps it to the domain
 * {@link TelemetryData} and hands it to
 * {@link EvaluateTelemetryAlertUseCase}.
 *
 * <p>Also re-broadcasts the same envelope to the STOMP topic
 * {@code /topic/telemetry} so the front-end dashboard can stream
 * live values (Change 008). The broker is already configured in
 * {@code WebSocketConfig}, and {@link SimpMessagingTemplate} is
 * auto-wired by {@code @EnableWebSocketMessageBroker}.</p>
 *
 * <p>Malformed JSON is logged and the message is committed (the
 * consumer does not retry forever; a future change adds a DLQ).</p>
 */
@Component
public class ProcessedTelemetryConsumer {

    private static final Logger log = LoggerFactory.getLogger(ProcessedTelemetryConsumer.class);

    private final ObjectMapper objectMapper;
    private final EvaluateTelemetryAlertUseCase useCase;
    private final SimpMessagingTemplate messagingTemplate;

    public ProcessedTelemetryConsumer(ObjectMapper objectMapper,
                                      EvaluateTelemetryAlertUseCase useCase,
                                      SimpMessagingTemplate messagingTemplate) {
        this.objectMapper = objectMapper;
        this.useCase = useCase;
        this.messagingTemplate = messagingTemplate;
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

        // Live fan-out for the dashboard (Change 008). The
        // SimpMessagingTemplate broadcasts to every subscriber of
        // /topic/telemetry on the in-memory broker. Failures here
        // are best-effort: the alert evaluation path below must
        // still run.
        try {
            messagingTemplate.convertAndSend("/topic/telemetry", envelope);
        } catch (Exception ex) {
            log.warn("WS fan-out to /topic/telemetry failed (continuing): {}",
                    ex.getMessage());
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
