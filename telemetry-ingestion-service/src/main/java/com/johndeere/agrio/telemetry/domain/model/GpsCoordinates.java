package com.johndeere.agrio.telemetry.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

/**
 * Pure-domain value object for a GPS reading. The {@code @JsonCreator}
 * constructor lets Jackson deserialise the JSON shape
 * {@code {"latitude": ..., "longitude": ...}} into this class.
 */
public final class GpsCoordinates {

    private final double latitude;
    private final double longitude;

    @JsonCreator
    public GpsCoordinates(@JsonProperty("latitude")  double latitude,
                          @JsonProperty("longitude") double longitude) {
        this.latitude  = latitude;
        this.longitude = longitude;
    }

    public double getLatitude()  { return latitude; }
    public double getLongitude() { return longitude; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GpsCoordinates that)) return false;
        return Double.compare(that.latitude, latitude) == 0
            && Double.compare(that.longitude, longitude) == 0;
    }

    @Override
    public int hashCode() { return Objects.hash(latitude, longitude); }

    @Override
    public String toString() {
        return "GpsCoordinates{lat=" + latitude + ", lng=" + longitude + "}";
    }
}
