package com.johndeere.agrio.fleet.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.Objects;

/**
 * JPA mapping of the {@code fleet.equipment} table.
 */
@Entity
@Table(name = "equipment", schema = "fleet")
public class EquipmentEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "model", length = 64, nullable = false)
    private String model;

    @Column(name = "serial_number", length = 64, nullable = false)
    private String serialNumber;

    @Column(name = "type", length = 32, nullable = false)
    private String type;

    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "horometer_hours", nullable = false)
    private double horometerHours;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    protected EquipmentEntity() {
        // JPA
    }

    public EquipmentEntity(String id,
                           String name,
                           String model,
                           String serialNumber,
                           String type,
                           String status,
                           double horometerHours,
                           LocalDate lastMaintenanceDate) {
        this.id                  = Objects.requireNonNull(id);
        this.name                = Objects.requireNonNull(name);
        this.model               = Objects.requireNonNull(model);
        this.serialNumber        = Objects.requireNonNull(serialNumber);
        this.type                = Objects.requireNonNull(type);
        this.status              = Objects.requireNonNull(status);
        this.horometerHours      = horometerHours;
        this.lastMaintenanceDate = lastMaintenanceDate;
    }

    public String    getId()                  { return id; }
    public String    getName()                { return name; }
    public String    getModel()               { return model; }
    public String    getSerialNumber()        { return serialNumber; }
    public String    getType()                { return type; }
    public String    getStatus()              { return status; }
    public double    getHorometerHours()      { return horometerHours; }
    public LocalDate getLastMaintenanceDate() { return lastMaintenanceDate; }

    public void setId(String id)                             { this.id = id; }
    public void setName(String name)                         { this.name = name; }
    public void setModel(String model)                       { this.model = model; }
    public void setSerialNumber(String serialNumber)         { this.serialNumber = serialNumber; }
    public void setType(String type)                         { this.type = type; }
    public void setStatus(String status)                     { this.status = status; }
    public void setHorometerHours(double horometerHours)     { this.horometerHours = horometerHours; }
    public void setLastMaintenanceDate(LocalDate date)       { this.lastMaintenanceDate = date; }
}
