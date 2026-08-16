package com.johndeere.agrio.operations.adapters.controller;

import com.johndeere.agrio.operations.domain.exception.WorkOrderNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Maps domain exceptions to HTTP responses with a stable JSON shape
 * (Change 022). Currently handles the only "not found" case; the
 * other domain rules throw {@code IllegalStateException} / {@code IllegalArgumentException}
 * upstream and bubble through the global 4xx/5xx Spring path.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(WorkOrderNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(WorkOrderNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "code", "WO_NOT_FOUND",
                "message", ex.getMessage()
        ));
    }
}
