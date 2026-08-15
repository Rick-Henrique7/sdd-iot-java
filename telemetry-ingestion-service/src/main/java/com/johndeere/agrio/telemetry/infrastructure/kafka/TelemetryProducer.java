package com.johndeere.agrio.telemetry.infrastructure.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Republishes each processed {@link TelemetryPayload} to the
 * {@code agri.telemetry.processed} topic. The {@code equipmentId} is
 * used as the Kafka message key so downstream consumers (the alert
 * engine) can read per-equipment in order.
 */
@Component
public class TelemetryProducer {

    private static final Logger log = LoggerFactory.getLogger(TelemetryProducer.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final String processedTopic;

    public TelemetryProducer(KafkaTemplate<String, String> kafkaTemplate,
                             ObjectMapper objectMapper,
                             @Value("${telemetry.topics.processed:agri.telemetry.processed}")
                             String processedTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.processedTopic = processedTopic;
    }

    public void sendProcessedTelemetry(TelemetryPayload payload) {
        try {
            String body = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(processedTopic, payload.getEquipmentId(), body);
        } catch (JsonProcessingException ex) {
            log.error("Could not serialise telemetry payload for processed topic: {}",
                    ex.getMessage());
            throw new IllegalStateException("Failed to serialise telemetry", ex);
        }
    }
}
