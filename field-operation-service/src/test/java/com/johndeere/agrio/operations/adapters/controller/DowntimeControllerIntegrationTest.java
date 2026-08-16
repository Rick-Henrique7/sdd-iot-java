package com.johndeere.agrio.operations.adapters.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.operations.FieldOperationApplication;
import com.johndeere.agrio.operations.adapters.dto.DowntimeDTO;
import com.johndeere.agrio.operations.domain.model.DowntimeReason;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(
        classes = FieldOperationApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
class DowntimeControllerIntegrationTest {

    @Autowired private WebApplicationContext context;
    private final ObjectMapper json = new ObjectMapper().findAndRegisterModules();

    private MockMvc mvc() {
        return MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void recordsDowntime() throws Exception {
        var dto = new DowntimeDTO(
                null, "TRAC-1", "OP-1",
                DowntimeReason.REFUELING,
                Instant.parse("2026-08-16T12:00:00Z"),
                null, "fuel stop");

        mvc().perform(post("/api/v1/operations/downtime")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.reason").value("REFUELING"))
                .andExpect(jsonPath("$.endTime").doesNotExist());
    }
}
