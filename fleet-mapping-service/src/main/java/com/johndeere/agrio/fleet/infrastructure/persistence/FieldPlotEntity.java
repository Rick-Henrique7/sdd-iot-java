package com.johndeere.agrio.fleet.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Objects;

/**
 * JPA mapping of the {@code fleet.field_plot} table. The polygon
 * is stored as a JSON string in a {@code TEXT} column (PostGIS-free
 * MVP — see design.md §6).
 */
@Entity
@Table(name = "field_plot", schema = "fleet")
public class FieldPlotEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "polygon_json", columnDefinition = "TEXT", nullable = false)
    private String polygonJson;

    @Column(name = "area_hectares", nullable = false)
    private double areaHectares;

    protected FieldPlotEntity() {
        // JPA
    }

    public FieldPlotEntity(String id, String name, String polygonJson, double areaHectares) {
        this.id           = Objects.requireNonNull(id);
        this.name         = Objects.requireNonNull(name);
        this.polygonJson  = Objects.requireNonNull(polygonJson);
        this.areaHectares = areaHectares;
    }

    public String getId()           { return id; }
    public String getName()         { return name; }
    public String getPolygonJson()  { return polygonJson; }
    public double getAreaHectares() { return areaHectares; }
}
