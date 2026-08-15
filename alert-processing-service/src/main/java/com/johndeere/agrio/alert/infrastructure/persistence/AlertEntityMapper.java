package com.johndeere.agrio.alert.infrastructure.persistence;

import com.johndeere.agrio.alert.domain.model.Alert;
import org.springframework.stereotype.Component;

/**
 * Domain {@link Alert} → JPA {@link AlertEntity}. Lives in
 * infrastructure so the domain layer never imports JPA classes.
 */
@Component
public class AlertEntityMapper {

    public AlertEntity toEntity(Alert alert) {
        return new AlertEntity(
                alert.getId(),
                alert.getEquipmentId(),
                alert.getSeverity().name(),
                alert.getMetricName(),
                alert.getCurrentValue(),
                alert.getThresholdValue(),
                alert.getMessage(),
                alert.getTimestamp()
        );
    }
}
