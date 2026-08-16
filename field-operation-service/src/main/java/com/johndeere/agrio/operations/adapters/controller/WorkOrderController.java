package com.johndeere.agrio.operations.adapters.controller;

import com.johndeere.agrio.operations.adapters.dto.WorkOrderDTO;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import com.johndeere.agrio.operations.usecase.CreateWorkOrderUseCase;
import com.johndeere.agrio.operations.usecase.UpdateWorkOrderStatusUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operations/work-orders")
public class WorkOrderController {

    private final CreateWorkOrderUseCase createUseCase;
    private final UpdateWorkOrderStatusUseCase updateUseCase;

    public WorkOrderController(
            CreateWorkOrderUseCase createUseCase,
            UpdateWorkOrderStatusUseCase updateUseCase) {
        this.createUseCase = createUseCase;
        this.updateUseCase = updateUseCase;
    }

    @PostMapping
    public ResponseEntity<WorkOrderDTO> create(@RequestBody @Valid WorkOrderDTO dto) {
        var created = createUseCase.execute(
                dto.equipmentId(),
                dto.fieldId(),
                dto.operatorId());
        return ResponseEntity.status(HttpStatus.CREATED).body(WorkOrderDTO.fromDomain(created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkOrderDTO> updateStatus(
            @PathVariable String id,
            @RequestBody StatusChangeRequest body) {
        var updated = updateUseCase.execute(id, body.status(), body.operatorNotes());
        return ResponseEntity.ok(WorkOrderDTO.fromDomain(updated));
    }

    /** Inner record avoids coupling the request body to the full DTO. */
    public record StatusChangeRequest(WorkOrderStatus status, String operatorNotes) {}
}
