package com.johndeere.agrio.fleet.domain.model;

import java.util.List;
import java.util.Objects;

/**
 * A geographical plot of land. The polygon is an *ordered* list
 * of vertices; the first and last are *expected* to coincide
 * (closed ring) but this domain class does not enforce it.
 */
public final class FieldPlot {

    private final String          id;
    private final String          name;
    private final List<GeoPoint>  polygon;
    private final double          areaHectares;

    public FieldPlot(String id,
                     String name,
                     List<GeoPoint> polygon,
                     double areaHectares) {
        this.id           = Objects.requireNonNull(id, "id");
        this.name         = Objects.requireNonNull(name, "name");
        Objects.requireNonNull(polygon, "polygon");
        if (polygon.size() < 3) {
            throw new IllegalArgumentException("polygon must have at least 3 vertices");
        }
        if (areaHectares < 0) {
            throw new IllegalArgumentException("areaHectares must be non-negative");
        }
        this.polygon      = List.copyOf(polygon);
        this.areaHectares = areaHectares;
    }

    public String         getId()           { return id; }
    public String         getName()         { return name; }
    public List<GeoPoint> getPolygon()      { return polygon; }
    public double         getAreaHectares() { return areaHectares; }
}
