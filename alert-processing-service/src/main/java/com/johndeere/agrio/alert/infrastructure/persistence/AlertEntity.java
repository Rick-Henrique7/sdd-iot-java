package com.johndeere.agrio.alert.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;

/**
 * JPA mapping of the {@code alert.alerts} table. Uses the alert id
 * (UUIDv4) as the primary key so the same value can be broadcast
 * on the WebSocket and stored in the DB without translation.
 */
@Entity
@Table(name = "alerts", schema = "alert")
public class AlertEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "equipment_id", length = 64, nullable = false)
    private String equipmentId;

    @Column(name = "severity", length = 16, nullable = false)
    private String severity;

    @Column(name = "metric_name", length = 32, nullable = false)
    private String metricName;

    @Column(name = "current_value", nullable = false)
    private double currentValue;

    @Column(name = "threshold_value", nullable = false)
    private double thresholdValue;

    @Column(name = "message", length = 512, nullable = false)
    private String message;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AlertEntity() {
        // JPA
    }

    public AlertEntity(String id,
                       String equipmentId,
                       String severity,
                       String metricName,
                       double currentValue,
                       double thresholdValue,
                       String message,
                       Instant createdAt) {
        this.id             = Objects.requireNonNull(id);
        this.equipmentId    = Objects.requireNonNull(equipmentId);
        this.severity       = Objects.requireNonNull(severity);
        this.metricName     = Objects.requireNonNull(metricName);
        this.currentValue   = currentValue;
        this.thresholdValue = thresholdValue;
        this.message        = Objects.requireNonNull(message);
        this.createdAt      = Objects.requireNonNull(createdAt);
    }

    public String  getId()             { return id; }
    public String  getEquipmentId()    { return equipmentId; }
    public String  getSeverity()       { return severity; }
    public String  getMetricName()     { return metricName; }
    public double  getCurrentValue()   { return currentValue; }
    public double  getThresholdValue() { return thresholdValue; }
    public String  getMessage()        { return message; }
    public Instant getCreatedAt()      { return createdAt; }
}
