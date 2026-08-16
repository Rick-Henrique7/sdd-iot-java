package com.johndeere.agrio.operations.domain.model;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

/**
 * Pure domain model for a downtime event.
 *
 * <p>A {@code DowntimeRecord} starts at {@code startTime} and may be
 * closed (with {@code endTime}) via {@link #close(Instant)}. The duration
 * is calculated on demand and never persisted.
 */
public final class DowntimeRecord {

    private final String id;
    private final String equipmentId;
    private final String operatorId;
    private final DowntimeReason reason;
    private final Instant startTime;
    private final Instant endTime;
    private final String comments;

    private DowntimeRecord(
            String id,
            String equipmentId,
            String operatorId,
            DowntimeReason reason,
            Instant startTime,
            Instant endTime,
            String comments) {
        this.id = Objects.requireNonNull(id);
        this.equipmentId = Objects.requireNonNull(equipmentId);
        this.operatorId = Objects.requireNonNull(operatorId);
        this.reason = Objects.requireNonNull(reason);
        this.startTime = Objects.requireNonNull(startTime);
        this.endTime = endTime;
        this.comments = comments;
    }

    public static DowntimeRecord start(
            String id,
            String equipmentId,
            String operatorId,
            DowntimeReason reason,
            Instant startTime,
            String comments) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("id must not be blank");
        }
        if (equipmentId == null || equipmentId.isBlank()) {
            throw new IllegalArgumentException("equipmentId must not be blank");
        }
        if (operatorId == null || operatorId.isBlank()) {
            throw new IllegalArgumentException("operatorId must not be blank");
        }
        if (startTime == null) {
            throw new IllegalArgumentException("startTime must not be null");
        }
        return new DowntimeRecord(id, equipmentId, operatorId, reason, startTime, null, comments);
    }

    public static DowntimeRecord rehydrate(
            String id,
            String equipmentId,
            String operatorId,
            DowntimeReason reason,
            Instant startTime,
            Instant endTime,
            String comments) {
        return new DowntimeRecord(id, equipmentId, operatorId, reason, startTime, endTime, comments);
    }

    public DowntimeRecord close(Instant endTime) {
        if (endTime == null) {
            throw new IllegalArgumentException("endTime must not be null");
        }
        if (endTime.isBefore(startTime)) {
            throw new IllegalArgumentException("endTime must not be before startTime");
        }
        if (this.endTime != null) {
            throw new IllegalStateException("Downtime record already closed");
        }
        return new DowntimeRecord(id, equipmentId, operatorId, reason,
                startTime, endTime, comments);
    }

    public Duration duration() {
        Instant end = endTime != null ? endTime : Instant.now();
        return Duration.between(startTime, end);
    }

    /**
     * Duration computed against a clock-supplied reference instant.
     * Used by tests that need a deterministic "now" without monkey-patching
     * {@link Instant#now()}.
     */
    public Duration durationAt(Instant referenceNow) {
        Instant end = endTime != null ? endTime : referenceNow;
        return Duration.between(startTime, end);
    }

    public boolean isOpen() {
        return endTime == null;
    }

    public String id() { return id; }
    public String equipmentId() { return equipmentId; }
    public String operatorId() { return operatorId; }
    public DowntimeReason reason() { return reason; }
    public Instant startTime() { return startTime; }
    public Instant endTime() { return endTime; }
    public String comments() { return comments; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DowntimeRecord d)) return false;
        return id.equals(d.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
