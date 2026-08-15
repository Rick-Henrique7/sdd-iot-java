Aqui está a especificação técnica detalhada do **Fleet & Mapping Service (`fleet-mapping-service`)**.

---

```markdown
# Especificação Técnica: Fleet & Mapping Service (`fleet-mapping-service`)

Este documento especifica o microsserviço **Fleet & Mapping Service**, responsável pelo gerenciamento de dados cadastrais da frota de máquinas agrícolas, delimitamento de talhões geográficos, controle de histórico de manutenção preventivas e consultas de geoprocessamento da **Plataforma Agro-IoT Integrada**[cite: 1].

---

## 1. Escopo e Responsabilidades

* **CRUD de Equipamentos/Frota:** Cadastro, edição, listagem e inativação de tratores, colheitadeiras e pulverizadores[cite: 1].
* **Gestão de Talhões & Geoprocessamento:** Armazenamento das coordenadas poligonais dos talhões de cultivo e cálculo de área[cite: 1].
* **Consultas de Histórico e Heatmap:** Fornecimento de dados agregados de telemetria e posições históricas para renderização do mapa de aplicação de defensivos (`leaflet.heat`) no Next.js[cite: 1].
* **Persistência Relacional:** Operações transacionais diretas no PostgreSQL (`schema: fleet`) via Spring Data JPA[cite: 1].

---

## 2. Arquitetura do Componente & Estrutura de Pastas

O microsserviço adota Clean Architecture isolada e padrão Repository para abstração de persistência[cite: 1].

```text
fleet-mapping-service/
├── Dockerfile
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/johndeere/agrio/fleet/
    │   │   ├── FleetMappingApplication.java
    │   │   ├── domain/
    │   │   │   ├── model/
    │   │   │   │   ├── Equipment.java
    │   │   │   │   ├── EquipmentStatus.java
    │   │   │   │   └── FieldPlot.java
    │   │   │   └── service/
    │   │   │       └── FleetDomainService.java
    │   │   ├── usecase/
    │   │   │   ├── RegisterEquipmentUseCase.java
    │   │   │   ├── ListFleetUseCase.java
    │   │   │   └── GetHeatmapDataUseCase.java
    │   │   ├── infrastructure/
    │   │   │   ├── config/
    │   │   │   │   └── SecurityConfig.java
    │   │   │   └── persistence/
    │   │   │       ├── EquipmentEntity.java
    │   │   │       ├── EquipmentJpaRepository.java
    │   │   │       ├── FieldPlotEntity.java
    │   │   │       └── FieldPlotJpaRepository.java
    │   │   └── adapters/
    │   │       ├── controller/
    │   │       │   ├── FleetController.java
    │   │       │   └── MappingController.java
    │   │       └── dto/
    │   │           ├── EquipmentDTO.java
    │   │           ├── FieldPlotDTO.java
    │   │           └── HeatmapPointDTO.java
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/johndeere/agrio/fleet/
            ├── usecase/RegisterEquipmentUseCaseTest.java
            └── controller/FleetControllerIntegrationTest.java

```

---

## 3. Contratos de API (Endpoints REST & DTOs)

### 3.1. Listagem de Frota (`GET /api/v1/fleet`)

#### Payload de Resposta (`List<EquipmentDTO>`)

```json
[
  {
    "id": "TRAC-7230J-001",
    "name": "Trator John Deere 7230J",
    "model": "7230J",
    "serialNumber": "1BM7230J00019283",
    "type": "TRACTOR",
    "status": "OPERATIONAL",
    "horometerHours": 1245.8,
    "lastMaintenanceDate": "2026-06-10"
  }
]

```

### 3.2. Consulta de Dados de Heatmap de Aplicação (`GET /api/v1/mapping/heatmaps?fieldId=FLD-01`)

#### Payload de Resposta (`List<HeatmapPointDTO>`)

```json
[
  {
    "latitude": -21.1704,
    "longitude": -47.8103,
    "intensity": 0.85
  },
  {
    "latitude": -21.1708,
    "longitude": -47.8106,
    "intensity": 0.92
  }
]

```

---

## 4. Controlador REST de Gestão de Frota (`FleetController.java`)

```java
package com.johndeere.agrio.fleet.adapters.controller;

import com.johndeere.agrio.fleet.adapters.dto.EquipmentDTO;
import com.johndeere.agrio.fleet.usecase.ListFleetUseCase;
import com.johndeere.agrio.fleet.usecase.RegisterEquipmentUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        List<EquipmentDTO> fleet = listFleetUseCase.execute();
        return ResponseEntity.ok(fleet);
    }

    @PostMapping
    public ResponseEntity<EquipmentDTO> registerEquipment(@RequestBody EquipmentDTO dto) {
        EquipmentDTO registered = registerEquipmentUseCase.execute(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }
}

```

---

## 5. Suíte de Testes Automatizados (JUnit 5 + Testcontainers)

Teste de integração do repositório relacional executando em um container real de PostgreSQL.

```java
package com.johndeere.agrio.fleet.controller;

import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentEntity;
import com.johndeere.agrio.fleet.infrastructure.persistence.EquipmentJpaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class FleetControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("agrio_fleet")
            .withUsername("agrio")
            .withPassword("agrio123");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EquipmentJpaRepository repository;

    @Test
    @DisplayName("Deve listar equipamentos cadastrados no PostgreSQL com sucesso")
    void shouldReturnListOfEquipment() throws Exception {
        EquipmentEntity entity = new EquipmentEntity("TRAC-01", "Trator 7230J", "7230J", "OPERATIONAL");
        repository.save(entity);

        mockMvc.perform(get("/api/v1/fleet")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("TRAC-01"))
                .andExpect(jsonPath("$[0].name").value("Trator 7230J"));
    }
}

```

---

## 6. Containerização Isolada (`Dockerfile`)

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/target/*.jar app.jar
USER appuser
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]

```

```

---

Quando quiser a especificação do próximo serviço (**`iot-simulator-service`**), basta solicitar.

```