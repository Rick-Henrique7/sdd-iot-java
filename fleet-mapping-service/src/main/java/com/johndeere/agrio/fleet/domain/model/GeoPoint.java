package com.johndeere.agrio.fleet.domain.model;

import java.util.Objects;

/**
 * A pure-domain (latitude, longitude) pair. No framework imports.
 */
public record GeoPoint(double latitude, double longitude) {

    public GeoPoint {
        if (latitude  < -90.0 || latitude  > 90.0)  throw new IllegalArgumentException("latitude out of range");
        if (longitude < -180.0 || longitude > 180.0) throw new IllegalArgumentException("longitude out of range");
        Objects.requireNonNull(this, "this");
    }
}
