package com.johndeere.agrio.fleet.adapters.controller;

import com.johndeere.agrio.fleet.adapters.dto.HeatmapPointDTO;
import com.johndeere.agrio.fleet.usecase.GetHeatmapDataUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public REST endpoints for mapping data (heatmaps). The MVP
 * returns deterministic synthetic points; a future change
 * aggregates real telemetry.
 */
@RestController
@RequestMapping("/api/v1/mapping")
public class MappingController {

    private final GetHeatmapDataUseCase getHeatmapDataUseCase;

    public MappingController(GetHeatmapDataUseCase getHeatmapDataUseCase) {
        this.getHeatmapDataUseCase = getHeatmapDataUseCase;
    }

    @GetMapping("/heatmaps")
    public ResponseEntity<List<HeatmapPointDTO>> getHeatmap(
            @RequestParam("fieldId") String fieldId) {
        return ResponseEntity.ok(getHeatmapDataUseCase.execute(fieldId));
    }
}
