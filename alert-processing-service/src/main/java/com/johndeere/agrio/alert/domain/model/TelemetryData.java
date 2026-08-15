package com.johndeere.agrio.alert.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Pure-domain, flat representation of one telemetry event as
 * consumed by the alert engine. The Kafka payload coming from
 * {@code telemetry-ingestion-service} has a nested
 * {@code gps}/{@code metrics} shape; the consumer maps it to
 * this flat POJO so the domain layer never sees the source
 * service's wire format.
 */
public final class TelemetryData {

    private final String equipmentId;
    private final Instant timestamp;
    private final double engineTemp;
    private final double rpm;
    private final double fuelLevel;
    private final double speed;

    public TelemetryData(String equipmentId,
                          Instant timestamp,
                          double engineTemp,
                          double rpm,
                          double fuelLevel,
                          double speed) {
        this.equipmentId = Objects.requireNonNull(equipmentId, "equipmentId");
        this.timestamp   = Objects.requireNonNull(timestamp, "timestamp");
        this.engineTemp  = engineTemp;
        this.rpm         = rpm;
        this.fuelLevel   = fuelLevel;
        this.speed       = speed;
    }

    public String getEquipmentId()  { return equipmentId; }
    public Instant getTimestamp()   { return timestamp; }
    public double getEngineTemp()   { return engineTemp; }
    public double getRpm()          { return rpm; }
    public double getFuelLevel()    { return fuelLevel; }
    public double getSpeed()        { return speed; }
}
