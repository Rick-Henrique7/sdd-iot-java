package com.johndeere.agrio.fleet.domain.model;

/**
 * Operational status of a piece of equipment. The front-end
 * maps each value to a colour and a filter.
 */
public enum EquipmentStatus {
    OPERATIONAL,
    MAINTENANCE,
    INACTIVE
}
