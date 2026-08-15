package com.johndeere.agrio.telemetry.adapters.dto;

/**
 * Reserved for future REST exposure. The service is a pure Kafka
 * worker in this change; the DTO is the same JSON shape as
 * {@code TelemetryPayload} and exists so that, if a controller is
 * added later, the contract is already aligned.
 */
public record TelemetryDTO(
        String equipmentId,
        String timestamp,
        GpsDTO  gps,
        MetricsDTO metrics
) {
    public record GpsDTO(double latitude, double longitude) {}
    public record MetricsDTO(double engineTemp, int rpm, double fuelLevel, double speed) {}
}
