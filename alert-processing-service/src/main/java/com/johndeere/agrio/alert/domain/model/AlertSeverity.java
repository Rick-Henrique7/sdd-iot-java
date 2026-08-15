package com.johndeere.agrio.alert.domain.model;

/**
 * Severity of an alert. The front-end maps each value to a colour
 * and a notification behaviour:
 * <ul>
 *     <li>{@link #INFO}     — neutral (e.g. started a new field plot).</li>
 *     <li>{@link #WARNING}  — parameter near the limit.</li>
 *     <li>{@link #CRITICAL} — hard limit breached; immediate attention.</li>
 * </ul>
 */
public enum AlertSeverity {
    INFO,
    WARNING,
    CRITICAL
}
