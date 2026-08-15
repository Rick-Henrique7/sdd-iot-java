package com.johndeere.agrio.fleet.domain.model;

import java.time.LocalDate;
import java.util.Objects;

/**
 * Pure-domain representation of a piece of equipment. All fields
 * are required except {@code lastMaintenanceDate}, which can be
 * {@code null} for newly onboarded machinery.
 */
public final class Equipment {

    private final String          id;
    private final String          name;
    private final String          model;
    private final String          serialNumber;
    private final EquipmentType   type;
    private final EquipmentStatus status;
    private final double          horometerHours;
    private final LocalDate       lastMaintenanceDate;

    public Equipment(String id,
                     String name,
                     String model,
                     String serialNumber,
                     EquipmentType type,
                     EquipmentStatus status,
                     double horometerHours,
                     LocalDate lastMaintenanceDate) {
        this.id                  = Objects.requireNonNull(id, "id");
        this.name                = Objects.requireNonNull(name, "name");
        this.model               = Objects.requireNonNull(model, "model");
        this.serialNumber        = Objects.requireNonNull(serialNumber, "serialNumber");
        this.type                = Objects.requireNonNull(type, "type");
        this.status              = Objects.requireNonNull(status, "status");
        if (horometerHours < 0) {
            throw new IllegalArgumentException("horometerHours must be non-negative");
        }
        this.horometerHours       = horometerHours;
        this.lastMaintenanceDate = lastMaintenanceDate;
    }

    public String          getId()                  { return id; }
    public String          getName()                { return name; }
    public String          getModel()               { return model; }
    public String          getSerialNumber()        { return serialNumber; }
    public EquipmentType   getType()                { return type; }
    public EquipmentStatus getStatus()              { return status; }
    public double          getHorometerHours()      { return horometerHours; }
    public LocalDate       getLastMaintenanceDate() { return lastMaintenanceDate; }
}
