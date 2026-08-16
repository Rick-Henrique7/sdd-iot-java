package com.johndeere.agrio.operations.adapters.controller;

import com.johndeere.agrio.operations.adapters.dto.DowntimeDTO;
import com.johndeere.agrio.operations.usecase.RecordDowntimeUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operations/downtime")
public class DowntimeController {

    private final RecordDowntimeUseCase recordUseCase;

    public DowntimeController(RecordDowntimeUseCase recordUseCase) {
        this.recordUseCase = recordUseCase;
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
}
