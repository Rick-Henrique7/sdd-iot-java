package com.johndeere.agrio.operations.infrastructure.messaging;

import com.johndeere.agrio.operations.adapters.dto.OperationEventDTO;
import com.johndeere.agrio.operations.domain.model.DowntimeRecord;
import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes operation events to the {@code agri.operations.events} Kafka topic.
 *
 * <p>Best-effort: any Kafka failure is logged at WARN and swallowed so the
 * REST request still returns 201/200. The Postgres write is the source of
 * truth; the event stream is for live dashboard visibility.
 */
@Component
public class OperationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OperationEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String topic;

    public OperationEventPublisher(
            KafkaTemplate<String, Object> kafkaTemplate,
            @Value("${app.kafka.topic.operations:agri.operations.events}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    public void publishWorkOrderCreated(WorkOrder w) {
        var event = new OperationEventDTO(
                "WORK_ORDER_CREATED",
                w.equipmentId(),
                w.id(),
                null,
                w.status().name(),
                w.createdAt());
        send(w.equipmentId(), event);
    }

    public void publishWorkOrderStatusChanged(WorkOrder w, WorkOrderStatus previous) {
        var event = new OperationEventDTO(
                "WORK_ORDER_STATUS_CHANGED",
                w.equipmentId(),
                w.id(),
                previous.name(),
                w.status().name(),
                w.updatedAt());
        send(w.equipmentId(), event);
    }

    public void publishDowntimeRecorded(DowntimeRecord r) {
        var event = new OperationEventDTO(
                "DOWNTIME_RECORDED",
                r.equipmentId(),
                r.id(),
                null,
                r.reason().name(),
                r.startTime());
        send(r.equipmentId(), event);
    }

    private void send(String key, OperationEventDTO event) {
        try {
            kafkaTemplate.send(topic, key, event);
        } catch (Exception e) {
            log.warn("Failed to publish operation event {}: {}", event.eventType(), e.getMessage());
        }
    }
}
