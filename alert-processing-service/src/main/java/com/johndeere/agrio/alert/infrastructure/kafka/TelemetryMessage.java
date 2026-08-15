package com.johndeere.agrio.alert.infrastructure.kafka;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

/**
 * Jackson DTO matching the JSON shape produced by
 * {@code telemetry-ingestion-service}. Lives in the infrastructure
 * layer so the domain {@code TelemetryData} never imports Jackson.
 */
public record TelemetryMessage(
        @JsonProperty("equipmentId") String equipmentId,
        @JsonProperty("timestamp")   Instant timestamp,
        @JsonProperty("gps")         Gps gps,
        @JsonProperty("metrics")     Metrics metrics
) {
    public record Gps(double latitude, double longitude) {}
    public record Metrics(double engineTemp, int rpm, double fuelLevel, double speed) {}

    @JsonCreator
    public TelemetryMessage {
        // canonical record constructor; explicit no-arg validation lives in
        // the consumer that builds the domain object.
    }
}
