package com.johndeere.agrio.operations.adapters.controller;

import com.johndeere.agrio.operations.adapters.dto.PageResponseDTO;
import com.johndeere.agrio.operations.adapters.dto.WorkOrderDTO;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import com.johndeere.agrio.operations.usecase.CreateWorkOrderUseCase;
import com.johndeere.agrio.operations.usecase.GetWorkOrderByIdUseCase;
import com.johndeere.agrio.operations.usecase.ListWorkOrdersUseCase;
import com.johndeere.agrio.operations.usecase.UpdateWorkOrderStatusUseCase;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operations/work-orders")
public class WorkOrderController {

    private static final int MAX_PAGE_SIZE = 200;
    private static final int DEFAULT_PAGE_SIZE = 50;

    private final CreateWorkOrderUseCase createUseCase;
    private final UpdateWorkOrderStatusUseCase updateUseCase;
    private final ListWorkOrdersUseCase listUseCase;
    private final GetWorkOrderByIdUseCase getByIdUseCase;

    public WorkOrderController(
            CreateWorkOrderUseCase createUseCase,
            UpdateWorkOrderStatusUseCase updateUseCase,
            ListWorkOrdersUseCase listUseCase,
            GetWorkOrderByIdUseCase getByIdUseCase) {
        this.createUseCase = createUseCase;
        this.updateUseCase = updateUseCase;
        this.listUseCase = listUseCase;
        this.getByIdUseCase = getByIdUseCase;
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

    @GetMapping
    public ResponseEntity<PageResponseDTO<WorkOrderDTO>> list(
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) String equipmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int safePage = Math.max(page, 0);
        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = listUseCase.execute(status, equipmentId, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(result, WorkOrderDTO::fromDomain));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderDTO> getById(@PathVariable String id) {
        var wo = getByIdUseCase.execute(id);
        return ResponseEntity.ok(WorkOrderDTO.fromDomain(wo));
    }

    /** Inner record avoids coupling the request body to the full DTO. */
    public record StatusChangeRequest(WorkOrderStatus status, String operatorNotes) {}
}
