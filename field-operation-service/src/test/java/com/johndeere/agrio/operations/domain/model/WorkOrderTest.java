package com.johndeere.agrio.operations.domain.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class WorkOrderTest {

    private final Instant now = Instant.parse("2026-08-16T12:00:00Z");

    @Test
    void createsInPendingState() {
        var wo = WorkOrder.create("WO-1", "TRAC-1", "FLD-1", "OP-1", now);
        assertEquals("WO-1", wo.id());
        assertEquals(WorkOrderStatus.PENDING, wo.status());
        assertEquals(now, wo.createdAt());
        assertEquals(now, wo.updatedAt());
    }

    @Test
    void allowsPendingToInProgress() {
        var wo = WorkOrder.create("WO-1", "TRAC-1", "FLD-1", "OP-1", now);
        var next = wo.withStatus(WorkOrderStatus.IN_PROGRESS, "starting", now.plusSeconds(60));
        assertEquals(WorkOrderStatus.IN_PROGRESS, next.status());
        assertEquals("starting", next.operatorNotes());
    }

    @Test
    void rejectsInProgressToPending() {
        var wo = WorkOrder.create("WO-1", "TRAC-1", "FLD-1", "OP-1", now)
                .withStatus(WorkOrderStatus.IN_PROGRESS, "go", now.plusSeconds(60));
        assertThrows(IllegalStateException.class,
                () -> wo.withStatus(WorkOrderStatus.PENDING, "back", now.plusSeconds(120)));
    }

    @Test
    void rejectsCompletedToAnything() {
        var wo = WorkOrder.create("WO-1", "TRAC-1", "FLD-1", "OP-1", now)
                .withStatus(WorkOrderStatus.IN_PROGRESS, "go", now.plusSeconds(60))
                .withStatus(WorkOrderStatus.COMPLETED, "done", now.plusSeconds(3600));
        assertThrows(IllegalStateException.class,
                () -> wo.withStatus(WorkOrderStatus.IN_PROGRESS, "again", now.plusSeconds(7200)));
    }

    @Test
    void rejectsBlankId() {
        assertThrows(IllegalArgumentException.class,
                () -> WorkOrder.create("", "TRAC-1", "FLD-1", "OP-1", now));
    }
}
