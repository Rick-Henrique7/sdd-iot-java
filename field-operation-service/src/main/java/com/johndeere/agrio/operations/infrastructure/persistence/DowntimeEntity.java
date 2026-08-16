package com.johndeere.agrio.operations.infrastructure.persistence;

import com.johndeere.agrio.operations.domain.model.DowntimeReason;
import com.johndeere.agrio.operations.domain.model.DowntimeRecord;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "downtime_records", schema = "operations")
public class DowntimeEntity {

    @Id
    @Column(name = "id", nullable = false, length = 64)
    private String id;

    @Column(name = "equipment_id", nullable = false, length = 64)
    private String equipmentId;

    @Column(name = "operator_id", nullable = false, length = 64)
    private String operatorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 64)
    private DowntimeReason reason;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected DowntimeEntity() {
        // JPA
    }

    public static DowntimeEntity fromDomain(DowntimeRecord r) {
        var e = new DowntimeEntity();
        e.id = r.id();
        e.equipmentId = r.equipmentId();
        e.operatorId = r.operatorId();
        e.reason = r.reason();
        e.startTime = r.startTime();
        e.endTime = r.endTime();
        e.comments = r.comments();
        e.createdAt = Instant.now();
        return e;
    }

    public DowntimeRecord toDomain() {
        return DowntimeRecord.rehydrate(id, equipmentId, operatorId, reason,
                startTime, endTime, comments);
    }

    public String getId() { return id; }
}
