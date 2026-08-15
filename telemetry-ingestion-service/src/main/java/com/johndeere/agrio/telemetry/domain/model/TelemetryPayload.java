package com.johndeere.agrio.telemetry.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Objects;

/**
 * Pure-domain representation of a single telemetry event. This is
 * the *contract* between the IoT simulator (producer) and the alert
 * engine (consumer). Field names MUST stay in sync with the JSON
 * shape documented in
 * {@code changes/003-telemetry-ingestion-service/spec.md}.
 */
public final class TelemetryPayload {

    private final String equipmentId;
    private final Instant timestamp;
    private final GpsCoordinates gps;
    private final TelemetryMetrics metrics;

    @JsonCreator
    public TelemetryPayload(@JsonProperty("equipmentId") String equipmentId,
                            @JsonProperty("timestamp")   Instant timestamp,
                            @JsonProperty("gps")         GpsCoordinates gps,
                            @JsonProperty("metrics")     TelemetryMetrics metrics) {
        this.equipmentId = Objects.requireNonNull(equipmentId, "equipmentId");
        this.timestamp   = Objects.requireNonNull(timestamp,   "timestamp");
        this.gps         = Objects.requireNonNull(gps,         "gps");
        this.metrics     = Objects.requireNonNull(metrics,     "metrics");
    }

    public String getEquipmentId()             { return equipmentId; }
    public Instant getTimestamp()              { return timestamp; }
    public GpsCoordinates getGps()             { return gps; }
    public TelemetryMetrics getMetrics()       { return metrics; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TelemetryPayload that)) return false;
        return equipmentId.equals(that.equipmentId)
            && timestamp.equals(that.timestamp)
            && gps.equals(that.gps)
            && metrics.equals(that.metrics);
    }

    @Override
    public int hashCode() { return Objects.hash(equipmentId, timestamp, gps, metrics); }
}
