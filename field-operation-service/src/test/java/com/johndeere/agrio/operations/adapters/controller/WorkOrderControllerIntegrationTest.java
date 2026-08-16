package com.johndeere.agrio.operations.adapters.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.operations.FieldOperationApplication;
import com.johndeere.agrio.operations.adapters.dto.WorkOrderDTO;
import com.johndeere.agrio.operations.domain.model.WorkOrderStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(
        classes = FieldOperationApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
class WorkOrderControllerIntegrationTest {

    @Autowired private WebApplicationContext context;
    private final ObjectMapper json = new ObjectMapper().findAndRegisterModules();

    private MockMvc mvc() {
        return MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void createAndUpdateStatusRoundTrip() throws Exception {
        var createDto = new WorkOrderDTO(
                null, "TRAC-1", "FLD-1", "OP-1", null, null, null, null);

        var result = mvc().perform(post("/api/v1/operations/work-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.id").exists())
                .andReturn();

        var created = json.readValue(result.getResponse().getContentAsString(), WorkOrderDTO.class);

        var updateBody = json.writeValueAsString(
                new WorkOrderController.StatusChangeRequest(WorkOrderStatus.IN_PROGRESS, "go"));

        mvc().perform(patch("/api/v1/operations/work-orders/" + created.id() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.operatorNotes").value("go"));
    }
}
