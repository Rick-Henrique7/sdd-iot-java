package com.johndeere.agrio.fleet.adapters.controller;

import com.johndeere.agrio.fleet.adapters.dto.EquipmentDTO;
import com.johndeere.agrio.fleet.usecase.ListFleetUseCase;
import com.johndeere.agrio.fleet.usecase.RegisterEquipmentUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public REST endpoints for fleet management. Authenticated by
 * the api-gateway — this controller is not aware of the JWT.
 */
@RestController
@RequestMapping("/api/v1/fleet")
public class FleetController {

    private final ListFleetUseCase listFleetUseCase;
    private final RegisterEquipmentUseCase registerEquipmentUseCase;

    public FleetController(ListFleetUseCase listFleetUseCase,
                          RegisterEquipmentUseCase registerEquipmentUseCase) {
        this.listFleetUseCase = listFleetUseCase;
        this.registerEquipmentUseCase = registerEquipmentUseCase;
    }

    @GetMapping
    public ResponseEntity<List<EquipmentDTO>> getAllFleet() {
        return ResponseEntity.ok(listFleetUseCase.execute());
    }

    @PostMapping
    public ResponseEntity<EquipmentDTO> registerEquipment(
            @Valid @RequestBody EquipmentDTO dto) {
        EquipmentDTO created = registerEquipmentUseCase.execute(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
