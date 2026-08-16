package com.johndeere.agrio.operations.adapters.dto;

import java.time.Instant;

/**
 * Generic envelope for all events on the {@code agri.operations.events} topic.
 *
 * @param eventType      one of {@code WORK_ORDER_CREATED},
 *                       {@code WORK_ORDER_STATUS_CHANGED},
 *                       {@code DOWNTIME_RECORDED},
 *                       {@code DOWNTIME_ENDED}.
 * @param equipmentId    Kafka message key (also consumer's partition).
 * @param aggregateId    id of the WorkOrder or Downtime record.
 * @param previousValue  status before the change (status events only).
 * @param newValue       status after the change, or reason (downtime).
 * @param occurredAt     server-side timestamp.
 */
public record OperationEventDTO(
        String eventType,
        String equipmentId,
        String aggregateId,
        String previousValue,
        String newValue,
        Instant occurredAt) {
}
