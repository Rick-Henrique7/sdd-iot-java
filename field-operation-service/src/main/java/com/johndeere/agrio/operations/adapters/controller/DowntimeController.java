package com.johndeere.agrio.operations.adapters.controller;

import com.johndeere.agrio.operations.adapters.dto.DowntimeDTO;
import com.johndeere.agrio.operations.adapters.dto.PageResponseDTO;
import com.johndeere.agrio.operations.usecase.ListDowntimeRecordsUseCase;
import com.johndeere.agrio.operations.usecase.RecordDowntimeUseCase;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operations/downtime")
public class DowntimeController {

    private static final int MAX_PAGE_SIZE = 200;
    private static final int DEFAULT_PAGE_SIZE = 50;

    private final RecordDowntimeUseCase recordUseCase;
    private final ListDowntimeRecordsUseCase listUseCase;

    public DowntimeController(RecordDowntimeUseCase recordUseCase,
                               ListDowntimeRecordsUseCase listUseCase) {
        this.recordUseCase = recordUseCase;
        this.listUseCase = listUseCase;
    }

    @PostMapping
    public ResponseEntity<DowntimeDTO> record(@RequestBody @Valid DowntimeDTO dto) {
        var record = recordUseCase.execute(
                dto.equipmentId(),
                dto.operatorId(),
                dto.reason(),
                dto.startTime(),
                dto.comments());
        return ResponseEntity.status(HttpStatus.CREATED).body(DowntimeDTO.fromDomain(record));
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<DowntimeDTO>> list(
            @RequestParam(required = false) String equipmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int safePage = Math.max(page, 0);
        var pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "startTime", "id"));
        var result = listUseCase.execute(equipmentId, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(result, DowntimeDTO::fromDomain));
    }
}
