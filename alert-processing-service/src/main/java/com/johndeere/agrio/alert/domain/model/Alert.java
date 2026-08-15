package com.johndeere.agrio.alert.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Immutable value object representing one fired alert. Built by
 * {@link com.johndeere.agrio.alert.domain.service.AlertEvaluatorService}
 * when a rule matches; persisted and broadcast on the WebSocket
 * by the use case.
 */
public final class Alert {

    private final String       id;
    private final String       equipmentId;
    private final AlertSeverity severity;
    private final String       metricName;
    private final double       currentValue;
    private final double       thresholdValue;
    private final String       message;
    private final Instant      timestamp;

    public Alert(String id,
                 String equipmentId,
                 AlertSeverity severity,
                 String metricName,
                 double currentValue,
                 double thresholdValue,
                 String message,
                 Instant timestamp) {
        this.id             = Objects.requireNonNull(id);
        this.equipmentId    = Objects.requireNonNull(equipmentId);
        this.severity       = Objects.requireNonNull(severity);
        this.metricName     = Objects.requireNonNull(metricName);
        this.currentValue   = currentValue;
        this.thresholdValue = thresholdValue;
        this.message        = Objects.requireNonNull(message);
        this.timestamp      = Objects.requireNonNull(timestamp);
    }

    public String       getId()             { return id; }
    public String       getEquipmentId()    { return equipmentId; }
    public AlertSeverity getSeverity()      { return severity; }
    public String       getMetricName()     { return metricName; }
    public double       getCurrentValue()   { return currentValue; }
    public double       getThresholdValue() { return thresholdValue; }
    public String       getMessage()        { return message; }
    public Instant      getTimestamp()      { return timestamp; }
}
