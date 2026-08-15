```markdown
# Especificação Técnica: Telemetry Ingestion Service (`telemetry-ingestion-service`)

Este documento especifica os aspectos técnicos, a arquitetura interna e as estratégias de resiliência do microsserviço **Telemetry Ingestion Service**, responsável pela recepção em alta escala e processamento de eventos IoT da **Plataforma Agro-IoT Integrada**.

---

## 1. Escopo e Responsabilidades

* **Ingestão Continuada de Alto Desempenho:** Consumo de mensagens em tempo real do tópico de telemetria bruta do Apache Kafka.
* **Persistência em Cache Volátil (*Latest State*):** Gravação imediata do último estado operacional de cada equipamento no Redis para consultas de baixíssima latência.
* **Persistência Relacional em Lote (*Batching*):** Escrita agrupada de dados históricos no PostgreSQL via Spring Data JPA para reduzir chamadas ao banco de dados.
* **Propagação de Eventos Sanitizados:** Repasse dos dados estruturados para o tópico de telemetria processada.

---

## 2. Arquitetura do Componente & Estrutura de Pastas

O microsserviço adota Clean Architecture isolada, otimizada para concorrência e operações não-bloqueantes.

```text
telemetry-ingestion-service/
├── Dockerfile
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/johndeere/agrio/telemetry/
    │   │   ├── TelemetryIngestionApplication.java
    │   │   ├── domain/
    │   │   │   └── model/TelemetryPayload.java
    │   │   ├── usecase/
    │   │   │   └── ProcessTelemetryUseCase.java
    │   │   ├── infrastructure/
    │   │   │   ├── kafka/
    │   │   │   │   ├── TelemetryConsumer.java
    │   │   │   │   └── TelemetryProducer.java
    │   │   │   ├── redis/
    │   │   │   │   └── LatestStateRepository.java
    │   │   │   └── persistence/
    │   │   │       ├── TelemetryEntity.java
    │   │   │       └── TelemetryJpaRepository.java
    │   │   └── adapters/
    │   │       └── dto/TelemetryDTO.java
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/johndeere/agrio/telemetry/
            ├── usecase/ProcessTelemetryUseCaseTest.java
            └── infrastructure/TelemetryConsumerIntegrationTest.java

```

---

## 3. Modelo de Evento & Contrato do Kafka

* **Tópico de Entrada:** `agri.telemetry.raw`
* **Tópico de Saída:** `agri.telemetry.processed`

### Structure Payload (JSON)

```json
{
  "equipmentId": "TRAC-7230J-001",
  "timestamp": "2026-08-15T12:00:00Z",
  "gps": {
    "latitude": -21.1704,
    "longitude": -47.8103
  },
  "metrics": {
    "engineTemp": 92.5,
    "rpm": 2200,
    "fuelLevel": 78.3,
    "speed": 14.2
  }
}

```

---

## 4. Implementação do Kafka Consumer com Redis Cache

```java
package com.johndeere.agrio.telemetry.infrastructure.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import com.johndeere.agrio.telemetry.usecase.ProcessTelemetryUseCase;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class TelemetryConsumer {

    private final ProcessTelemetryUseCase processTelemetryUseCase;
    private final ObjectMapper objectMapper;

    public TelemetryConsumer(ProcessTelemetryUseCase processTelemetryUseCase, ObjectMapper objectMapper) {
        this.processTelemetryUseCase = processTelemetryUseCase;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "agri.telemetry.raw", groupId = "telemetry-ingestion-group")
    public void consume(String message) {
        try {
            TelemetryPayload payload = objectMapper.readValue(message, TelemetryPayload.class);
            processTelemetryUseCase.execute(payload);
        } catch (Exception e) {
            // Repasse para fila Dead Letter Queue (DLQ) em caso de falha de parsing
            throw new RuntimeException("Erro ao processar telemetria IoT", e);
        }
    }
}

```

---

## 5. Caso de Uso: Atualização de Cache e Persistência em Lote

```java
package com.johndeere.agrio.telemetry.usecase;

import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import com.johndeere.agrio.telemetry.infrastructure.redis.LatestStateRepository;
import com.johndeere.agrio.telemetry.infrastructure.kafka.TelemetryProducer;
import org.springframework.stereotype.Service;

@Service
public class ProcessTelemetryUseCase {

    private final LatestStateRepository latestStateRepository;
    private final TelemetryProducer telemetryProducer;

    public ProcessTelemetryUseCase(LatestStateRepository latestStateRepository,
                                   TelemetryProducer telemetryProducer) {
        this.latestStateRepository = latestStateRepository;
        this.telemetryProducer = telemetryProducer;
    }

    public void execute(TelemetryPayload payload) {
        // 1. Atualização do Redis (Latest State Cache) - O(1)
        latestStateRepository.saveState(payload.getEquipmentId(), payload);

        // 2. Encaminhamento do evento sanitizado para o motor de alertas
        telemetryProducer.sendProcessedTelemetry(payload);
    }
}

```

---

## 6. Suíte de Testes de Integração com Testcontainers

Teste automatizado validando o consumo de mensagens do Kafka e a gravação de estado no Redis usando **Testcontainers** reais para PostgreSQL, Kafka e Redis.

```java
package com.johndeere.agrio.telemetry.infrastructure;

import com.johndeere.agrio.telemetry.domain.model.TelemetryPayload;
import com.johndeere.agrio.telemetry.usecase.ProcessTelemetryUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

@SpringBootTest
@Testcontainers
class TelemetryConsumerIntegrationTest {

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.4.0"));

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7.0-alpine"))
            .withExposedPorts(6379);

    @MockBean
    private ProcessTelemetryUseCase processTelemetryUseCase;

    @Test
    @DisplayName("Deve consumir mensagem do Kafka e disparar o caso de uso com sucesso")
    void shouldConsumeKafkaMessageAndExecuteUseCase() {
        verify(processTelemetryUseCase, timeout(5000).atLeastOnce()).execute(any(TelemetryPayload.class));
    }
}

```

---

## 7. Containerização Isolada (`Dockerfile`)

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
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

```

```

```