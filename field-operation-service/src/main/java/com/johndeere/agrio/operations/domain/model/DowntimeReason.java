package com.johndeere.agrio.operations.domain.model;

/**
 * Pre-defined reasons an operator may stop a machine.
 *
 * <p>Mirrors the spec in
 * {@code docs/backend/microservices-specification/field-operation-service.md}.
 */
public enum DowntimeReason {

    REFUELING,
    MECHANICAL_BREAKDOWN,
    WEATHER_ADVERSE,
    MEAL_BREAK
}
