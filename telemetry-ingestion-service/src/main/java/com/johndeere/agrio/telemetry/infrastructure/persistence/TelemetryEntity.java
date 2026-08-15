package com.johndeere.agrio.telemetry.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;

/**
 * JPA mapping of the {@code telemetry.telemetry_events} table.
 * Stores the historical record of every consumed telemetry event.
 */
@Entity
@Table(name = "telemetry_events", schema = "telemetry")
public class TelemetryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "equipment_id",    length = 64, nullable = false)
    private String equipmentId;

    @Column(name = "event_timestamp", nullable = false)
    private Instant eventTimestamp;

    @Column(name = "latitude",        nullable = false)
    private double latitude;

    @Column(name = "longitude",       nullable = false)
    private double longitude;

    @Column(name = "engine_temp",     nullable = false)
    private double engineTemp;

    @Column(name = "rpm",             nullable = false)
    private int rpm;

    @Column(name = "fuel_level",      nullable = false)
    private double fuelLevel;

    @Column(name = "speed",           nullable = false)
    private double speed;

    @Column(name = "created_at",      nullable = false)
    private Instant createdAt;

    protected TelemetryEntity() {
        // JPA
    }

    public TelemetryEntity(String equipmentId,
                           Instant eventTimestamp,
                           double latitude,
                           double longitude,
                           double engineTemp,
                           int rpm,
                           double fuelLevel,
                           double speed,
                           Instant createdAt) {
        this.equipmentId    = Objects.requireNonNull(equipmentId);
        this.eventTimestamp = Objects.requireNonNull(eventTimestamp);
        this.latitude       = latitude;
        this.longitude      = longitude;
        this.engineTemp     = engineTemp;
        this.rpm            = rpm;
        this.fuelLevel      = fuelLevel;
        this.speed          = speed;
        this.createdAt      = Objects.requireNonNull(createdAt);
    }

    public Long    getId()             { return id; }
    public String  getEquipmentId()    { return equipmentId; }
    public Instant getEventTimestamp() { return eventTimestamp; }
    public double  getLatitude()       { return latitude; }
    public double  getLongitude()      { return longitude; }
    public double  getEngineTemp()     { return engineTemp; }
    public int     getRpm()            { return rpm; }
    public double  getFuelLevel()      { return fuelLevel; }
    public double  getSpeed()          { return speed; }
    public Instant getCreatedAt()      { return createdAt; }
}
