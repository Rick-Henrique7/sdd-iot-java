package com.johndeere.agrio.alert.adapters.dto;

import com.johndeere.agrio.alert.domain.model.Alert;
import com.johndeere.agrio.alert.domain.model.AlertSeverity;

import java.time.Instant;

/**
 * Wire contract for the STOMP {@code /topic/alerts} channel.
 * Field order and names match the spec verbatim.
 */
public record AlertDTO(
        String alertId,
        String equipmentId,
        AlertSeverity severity,
        String metricName,
        double currentValue,
        double thresholdValue,
        String message,
        Instant timestamp
) {
    public static AlertDTO fromDomain(Alert alert) {
        return new AlertDTO(
                alert.getId(),
                alert.getEquipmentId(),
                alert.getSeverity(),
                alert.getMetricName(),
                alert.getCurrentValue(),
                alert.getThresholdValue(),
                alert.getMessage(),
                alert.getTimestamp()
        );
    }
}
