package com.johndeere.agrio.fleet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.fleet.adapters.controller.ApiExceptionHandler;
import com.johndeere.agrio.fleet.adapters.controller.FleetController;
import com.johndeere.agrio.fleet.adapters.dto.EquipmentDTO;
import com.johndeere.agrio.fleet.domain.model.EquipmentStatus;
import com.johndeere.agrio.fleet.domain.model.EquipmentType;
import com.johndeere.agrio.fleet.usecase.ListFleetUseCase;
import com.johndeere.agrio.fleet.usecase.RegisterEquipmentUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = FleetController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
@TestPropertySource(properties = "jwt.secret=test-secret-test-secret-test-secret-12345678")
class FleetControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private ListFleetUseCase listFleetUseCase;
    @MockBean private RegisterEquipmentUseCase registerEquipmentUseCase;

    @Test
    @DisplayName("GET /api/v1/fleet 200 retorna lista do use case")
    void shouldReturnFleetList() throws Exception {
        when(listFleetUseCase.execute()).thenReturn(List.of(
                new EquipmentDTO("TRAC-01", "Trator 7230J", "7230J", "SN-1",
                        EquipmentType.TRACTOR, EquipmentStatus.OPERATIONAL, 100.0, null)
        ));

        mockMvc.perform(get("/api/v1/fleet")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("TRAC-01"))
                .andExpect(jsonPath("$[0].type").value("TRACTOR"));
    }

    @Test
    @DisplayName("POST /api/v1/fleet 201 com payload valido")
    void shouldRegisterAndReturn201() throws Exception {
        EquipmentDTO dto = new EquipmentDTO(
                "TRAC-02", "Trator 7230J", "7230J", "SN-2",
                EquipmentType.TRACTOR, EquipmentStatus.OPERATIONAL, 0.0, null);
        when(registerEquipmentUseCase.execute(any())).thenReturn(dto);

        mockMvc.perform(post("/api/v1/fleet")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("TRAC-02"));
    }

    @Test
    @DisplayName("POST /api/v1/fleet 400 com payload invalido")
    void shouldReturn400OnInvalidPayload() throws Exception {
        String badJson = "{\"id\": \"\", \"name\": \"\"}";

        mockMvc.perform(post("/api/v1/fleet")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("FLEET_VALIDATION_ERROR"));
    }
}
