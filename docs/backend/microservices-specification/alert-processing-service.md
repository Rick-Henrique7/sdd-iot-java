```markdown
# Especificação Técnica: Alert Processing Service (`alert-processing-service`)

Este documento especifica o microsserviço **Alert Processing Service**, responsável pela avaliação em tempo real das métricas de telemetria, detecção de anomalias operacionais, geração de alertas preditivos e notificação instantânea do operador via WebSocket no ecossistema da **Plataforma Agro-IoT Integrada**[cite: 1].

---

## 1. Escopo e Responsabilidades

* **Processamento de Eventos Preditivos:** Consumo contínuo do tópico de telemetria processada do Apache Kafka (`agri.telemetry.processed`)[cite: 1].
* **Avaliação de Tolerância Operacional:** Comparação das métricas recebidas (RPM, temperatura do óleo, nível de combustível, velocidade) com as regras de limiar parametrizadas[cite: 1].
* **Notificação Instantânea (Push):** Disparo de alertas em tempo real para o cliente Next.js via protocolo **WebSocket (STOMP / SockJS)**[cite: 1].
* **Persistência do Histórico de Alertas:** Gravação dos alertas gerados no banco de dados PostgreSQL para relatórios e auditoria[cite: 1].

---

## 2. Arquitetura do Componente & Estrutura de Pastas

O microsserviço adota Clean Architecture isolada, priorizando o desacoplamento das regras de avaliação de anomalia dos conectores de mensageria[cite: 1].

```text
alert-processing-service/
├── Dockerfile
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/johndeere/agrio/alert/
    │   │   ├── AlertProcessingApplication.java
    │   │   ├── domain/
    │   │   │   ├── model/
    │   │   │   │   ├── Alert.java
    │   │   │   │   ├── AlertSeverity.java
    │   │   │   │   └── TelemetryData.java
    │   │   │   └── service/
    │   │   │       └── AlertEvaluatorService.java
    │   │   ├── usecase/
    │   │   │   └── EvaluateTelemetryAlertUseCase.java
    │   │   ├── infrastructure/
    │   │   │   ├── kafka/
    │   │   │   │   └── ProcessedTelemetryConsumer.java
    │   │   │   ├── websocket/
    │   │   │   │   ├── WebSocketConfig.java
    │   │   │   │   └── AlertWebSocketPublisher.java
    │   │   │   └── persistence/
    │   │   │       ├── AlertEntity.java
    │   │   │       └── AlertJpaRepository.java
    │   │   └── adapters/
    │   │       └── dto/AlertDTO.java
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/johndeere/agrio/alert/
            ├── domain/service/AlertEvaluatorServiceTest.java
            └── usecase/EvaluateTelemetryAlertUseCaseTest.java

```

---

## 3. Modelo do Alerta & Payload WebSocket

### 3.1. Enumeração de Severidade (`AlertSeverity.java`)

* `INFO`: Atualizações operacionais neutras (ex: início de talhão, nível de combustível em 20%).
* `WARNING`: Parâmetros próximos do limite tolerável (ex: temperatura do óleo entre 88°C e 94°C).
* `CRITICAL`: Violação grave de parâmetro técnico (ex: temperatura > 95°C ou RPM > 2500 em sobrecarga).

### 3.2. Contrato do Payload WebSocket (`AlertDTO.java`)

Envio em formato JSON para o canal `/topic/alerts`:

```json
{
  "alertId": "ALT-883921-2026",
  "equipmentId": "TRAC-7230J-001",
  "severity": "CRITICAL",
  "metricName": "engineTemp",
  "currentValue": 98.4,
  "thresholdValue": 95.0,
  "message": "Temperatura do motor acima do limite crítico seguro (98.4°C). Risco de superaquecimento.",
  "timestamp": "2026-08-15T12:13:32Z"
}

```

---

## 4. Avaliador de Regras de Negócio (`AlertEvaluatorService.java`)

Camada de domínio pura, sem anotações de frameworks:

```java
package com.johndeere.agrio.alert.domain.service;

import com.johndeere.agrio.alert.domain.model.Alert;
import com.johndeere.agrio.alert.domain.model.AlertSeverity;
import com.johndeere.agrio.alert.domain.model.TelemetryData;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public class AlertEvaluatorService {

    private static final double MAX_ENGINE_TEMP = 95.0;
    private static final double MAX_RPM = 2500.0;

    public Optional<Alert> evaluate(TelemetryData telemetry) {
        if (telemetry.getMetrics().getEngineTemp() > MAX_ENGINE_TEMP) {
            return Optional.of(new Alert(
                    UUID.randomUUID().toString(),
                    telemetry.getEquipmentId(),
                    AlertSeverity.CRITICAL,
                    "engineTemp",
                    telemetry.getMetrics().getEngineTemp(),
                    MAX_ENGINE_TEMP,
                    "Temperatura do motor acima do limite crítico seguro (" + telemetry.getMetrics().getEngineTemp() + "°C).",
                    Instant.now()
            ));
        }

        if (telemetry.getMetrics().getRpm() > MAX_RPM) {
            return Optional.of(new Alert(
                    UUID.randomUUID().toString(),
                    telemetry.getEquipmentId(),
                    AlertSeverity.WARNING,
                    "rpm",
                    telemetry.getMetrics().getRpm(),
                    MAX_RPM,
                    "Operação em rotação elevada (" + telemetry.getMetrics().getRpm() + " RPM). Risco de desgaste prematuro.",
                    Instant.now()
            ));
        }

        return Optional.empty();
    }
}

```

---

## 5. Publicador WebSocket (`AlertWebSocketPublisher.java`)

```java
package com.johndeere.agrio.alert.infrastructure.websocket;

import com.johndeere.agrio.alert.adapters.dto.AlertDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class AlertWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public AlertWebSocketPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishAlert(AlertDTO alertDTO) {
        // Envia o alerta para todos os clientes inscritos na rota do broker STOMP
        messagingTemplate.convertAndSend("/topic/alerts", alertDTO);
    }
}

```

---

## 6. Suíte de Testes Unitários de Domínio (JUnit 5 + Mockito)

Validação das regras de disparo de alertas no domínio:

```java
package com.johndeere.agrio.alert.domain.service;

import com.johndeere.agrio.alert.domain.model.Alert;
import com.johndeere.agrio.alert.domain.model.AlertSeverity;
import com.johndeere.agrio.alert.domain.model.TelemetryData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AlertEvaluatorServiceTest {

    private AlertEvaluatorService evaluatorService;

    @BeforeEach
    void setUp() {
        evaluatorService = new AlertEvaluatorService();
    }

    @Test
    @DisplayName("Deve gerar alerta CRITICAL quando a temperatura do motor ultrapassar 95°C")
    void shouldGenerateCriticalAlertWhenTempExceedsThreshold() {
        TelemetryData telemetry = new TelemetryData("TRAC-01", Instant.now(), 98.5, 2100.0);

        Optional<Alert> alert = evaluatorService.evaluate(telemetry);

        assertTrue(alert.isPresent());
        assertEquals(AlertSeverity.CRITICAL, alert.get().getSeverity());
        assertEquals("engineTemp", alert.get().getMetricName());
        assertEquals(98.5, alert.get().getCurrentValue());
    }

    @Test
    @DisplayName("Não deve gerar alerta quando as métricas estiverem dentro dos limites normais")
    void shouldNotGenerateAlertWhenMetricsAreNormal() {
        TelemetryData telemetry = new TelemetryData("TRAC-01", Instant.now(), 88.0, 2000.0);

        Optional<Alert> alert = evaluatorService.evaluate(telemetry);

        assertFalse(alert.isPresent());
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
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]

```

```

```