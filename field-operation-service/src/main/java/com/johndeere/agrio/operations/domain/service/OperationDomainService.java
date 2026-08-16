package com.johndeere.agrio.operations.domain.service;

import com.johndeere.agrio.operations.domain.model.DowntimeRecord;
import com.johndeere.agrio.operations.domain.model.WorkOrder;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Pure domain service. Stateless. Encodes the business rules for the
 * lifecycle of a WorkOrder and the bookkeeping for a Downtime record.
 *
 * <p>Annotated with {@link Service} so Spring can inject it into the
 * use-case beans. The class itself has no Spring / JPA / Kafka imports
 * beyond this single annotation.
 */
@Service
public class OperationDomainService {

    public WorkOrder createWorkOrder(
            String id,
            String equipmentId,
            String fieldId,
            String operatorId,
            Instant now) {
        return WorkOrder.create(id, equipmentId, fieldId, operatorId, now);
    }

    public WorkOrder updateStatus(
            WorkOrder current,
            WorkOrderStatus nextStatus,
            String notes,
            Instant now) {
        return current.withStatus(nextStatus, notes, now);
    }

    public DowntimeRecord recordDowntime(
            String id,
            String equipmentId,
            String operatorId,
            com.johndeere.agrio.operations.domain.model.DowntimeReason reason,
            Instant startTime,
            String comments) {
        return DowntimeRecord.start(id, equipmentId, operatorId, reason, startTime, comments);
    }
}
