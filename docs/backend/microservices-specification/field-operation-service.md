```markdown
# Especificação Técnica: Field Operation Service (`field-operation-service`)

Este documento especifica o novo microsserviço **Field Operation Service**, responsável pela gestão do diário de bordo do operador, ciclo de vida de Ordens de Serviço (O.S.), apontamento de paradas operacionais e registro de consumo de insumos na **Plataforma Agro-IoT Integrada**.

---

## 1. Escopo e Responsabilidades

* **Gestão de Ordens de Serviço (O.S.):** Criação, atribuição (Gestor -> Operador) e atualização do status de execução (PENDING, IN_PROGRESS, COMPLETED, CANCELLED).
* **Apontamento de Paradas de Máquina:** Registro em tempo real de interrupções no campo (ex: Abastecimento, Manutenção, Clima Adverso, Refeição) com cálculo de tempo ocioso.
* **Diário de Bordo do Operador:** Registro de check-in/check-out de jornada atrelado a um equipamento (`equipmentId`) e talhão (`fieldId`).
* **Mensageria e Eventos:** Publicação de eventos operacionais no Apache Kafka (`agri.operations.events`) para acompanhamento ao vivo no Dashboard do Gestor.
* **Persistência Relacional:** Armazenamento transacional direto no PostgreSQL (`schema: operations`) via Spring Data JPA.

---

## 2. Arquitetura do Componente & Estrutura de Pastas

```text
field-operation-service/
├── Dockerfile
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/johndeere/agrio/operations/
    │   │   ├── FieldOperationApplication.java
    │   │   ├── domain/
    │   │   │   ├── model/
    │   │   │   │   ├── WorkOrder.java
    │   │   │   │   ├── DowntimeRecord.java
    │   │   │   │   └── WorkOrderStatus.java
    │   │   │   └── service/
    │   │   │       └── OperationDomainService.java
    │   │   ├── usecase/
    │   │   │   ├── CreateWorkOrderUseCase.java
    │   │   │   ├── RecordDowntimeUseCase.java
    │   │   │   └── UpdateWorkOrderStatusUseCase.java
    │   │   ├── infrastructure/
    │   │   │   ├── config/
    │   │   │   │   └── KafkaProducerConfig.java
    │   │   │   ├── messaging/
    │   │   │   │   └── OperationEventPublisher.java
    │   │   │   └── persistence/
    │   │   │       ├── WorkOrderEntity.java
    │   │   │       ├── WorkOrderJpaRepository.java
    │   │   │       ├── DowntimeEntity.java
    │   │   │       └── DowntimeJpaRepository.java
    │   │   └── adapters/
    │   │       ├── controller/
    │   │       │   ├── WorkOrderController.java
    │   │       │   └── DowntimeController.java
    │   │       └── dto/
    │   │           ├── WorkOrderDTO.java
    │   │           ├── DowntimeDTO.java
    │   │           └── OperationEventDTO.java
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/johndeere/agrio/operations/
            └── controller/WorkOrderControllerTest.java
```

---

## 3. Contratos de API (Endpoints REST & DTOs)

### 3.1. Registro de Parada do Operador (`POST /api/v1/operations/downtime`)

#### Payload de Requisição (`DowntimeDTO`)

```json
{
  "equipmentId": "TRAC-7230J-001",
  "operatorId": "OP-9942",
  "reason": "MAINTENANCE_REFUELING",
  "startTime": "2026-08-16T13:30:00Z",
  "comments": "Parada para reabastecimento de combustível e checagem de nível de óleo."
}
```

### 3.2. Atualização de Status da Ordem de Serviço (`PATCH /api/v1/operations/work-orders/{id}/status`)

#### Payload de Requisição

```json
{
  "status": "IN_PROGRESS",
  "operatorNotes": "Iniciando pulverização na faixa norte do Talhão 01."
}
```

---

## 4. Controlador REST de Ordens de Serviço (`WorkOrderController.java`)

```java
package com.johndeere.agrio.operations.adapters.controller;

import com.johndeere.agrio.operations.adapters.dto.WorkOrderDTO;
import com.johndeere.agrio.operations.usecase.CreateWorkOrderUseCase;
import com.johndeere.agrio.operations.usecase.UpdateWorkOrderStatusUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operations/work-orders")
public class WorkOrderController {

    private final CreateWorkOrderUseCase createWorkOrderUseCase;
    private final UpdateWorkOrderStatusUseCase updateStatusUseCase;

    public WorkOrderController(CreateWorkOrderUseCase createWorkOrderUseCase,
                               UpdateWorkOrderStatusUseCase updateStatusUseCase) {
        this.createWorkOrderUseCase = createWorkOrderUseCase;
        this.updateStatusUseCase = updateStatusUseCase;
    }

    @PostMapping
    public ResponseEntity<WorkOrderDTO> createWorkOrder(@RequestBody WorkOrderDTO dto) {
        WorkOrderDTO created = createWorkOrderUseCase.execute(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkOrderDTO> updateStatus(@PathVariable String id,
                                                     @RequestBody WorkOrderDTO dto) {
        WorkOrderDTO updated = updateStatusUseCase.execute(id, dto.getStatus(), dto.getOperatorNotes());
        return ResponseEntity.ok(updated);
    }
}
```

---

## 5. Publicador de Eventos Kafka (`OperationEventPublisher.java`)

```java
package com.johndeere.agrio.operations.infrastructure.messaging;

import com.johndeere.agrio.operations.adapters.dto.OperationEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OperationEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OperationEventPublisher.class);
    private static final String TOPIC = "agri.operations.events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OperationEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishEvent(String equipmentId, OperationEventDTO event) {
        log.info("Publicando evento operacional para equipamento {}: {}", equipmentId, event.getEventType());
        this.kafkaTemplate.send(TOPIC, equipmentId, event);
    }
}
```

---

## 6. Containerização Multi-Stage (`Dockerfile`)

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
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 7. Integração com o Ecossistema

| Componente            | Tipo de Integração        | Descrição                                                                  |
| --------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `auth-service`        | JWT validation (gateway)  | Todas as requisições passam pelo `api-gateway` que valida o Bearer token.  |
| `fleet-mapping-service` | REST (sync)              | Resolve `equipmentId` e `fieldId` para o diário de bordo.                  |
| `iot-simulator-service` | Kafka (assíncrono)       | Eventos de consumo de combustível e telemetria complementam paradas.        |
| `alert-processing-service` | Kafka (assíncrono)   | Regras reativas sobre eventos operacionais (paradas > 30 min disparam alerta). |
| `api-gateway`         | HTTP (porta `8085`)       | Roteia `/api/v1/operations/**` para este novo serviço.                      |
| PostgreSQL `operations` schema | JDBC              | Tabelas `work_orders`, `downtime_records`, `operator_logs`.                |

---

## 8. Próximos Passos

1. Criar `changes/014-field-operation-service/proposal.md + spec.md + design.md + tasks.md` aplicando a SDD.
2. Definir o esqueleto Maven e o `pom.xml` espelhando `fleet-mapping-service` (Spring Boot 3.3.4, Java 17, Spring Cloud 2023.0.3, Spring Data JPA, Spring Kafka).
3. Provisionar o schema `operations` no `docker-compose.yml` (init SQL) e adicionar o container `agrio-field-operation-service` (porta `8085`).
4. Configurar a rota no `api-gateway` (`spring.cloud.gateway.routes[].uri = http://field-operation-service:8085`).
5. Atualizar o `README.md` raiz com a nova URL, diagrama e tabela de changes.
```
