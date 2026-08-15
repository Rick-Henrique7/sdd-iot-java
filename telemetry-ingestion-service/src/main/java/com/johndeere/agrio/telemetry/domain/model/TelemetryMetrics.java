package com.johndeere.agrio.telemetry.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

/**
 * Pure-domain value object for the four operational metrics produced
 * by the IoT simulator. Field names match the wire contract
 * (engineTemp / rpm / fuelLevel / speed).
 */
public final class TelemetryMetrics {

    private final double engineTemp;
    private final int    rpm;
    private final double fuelLevel;
    private final double speed;

    @JsonCreator
    public TelemetryMetrics(@JsonProperty("engineTemp") double engineTemp,
                            @JsonProperty("rpm")        int    rpm,
                            @JsonProperty("fuelLevel")  double fuelLevel,
                            @JsonProperty("speed")      double speed) {
        this.engineTemp = engineTemp;
        this.rpm        = rpm;
        this.fuelLevel  = fuelLevel;
        this.speed      = speed;
    }

    public double getEngineTemp() { return engineTemp; }
    public int    getRpm()        { return rpm; }
    public double getFuelLevel()  { return fuelLevel; }
    public double getSpeed()      { return speed; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TelemetryMetrics that)) return false;
        return Double.compare(that.engineTemp, engineTemp) == 0
            && rpm == that.rpm
            && Double.compare(that.fuelLevel, fuelLevel) == 0
            && Double.compare(that.speed, speed) == 0;
    }

    @Override
    public int hashCode() { return Objects.hash(engineTemp, rpm, fuelLevel, speed); }
}
