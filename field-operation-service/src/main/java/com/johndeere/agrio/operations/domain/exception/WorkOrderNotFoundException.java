package com.johndeere.agrio.operations.domain.exception;

public class WorkOrderNotFoundException extends RuntimeException {
    public WorkOrderNotFoundException(String id) {
        super("WorkOrder not found: " + id);
    }
}
