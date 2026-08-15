# Design — Change 004: alert-processing-service

> **Technical decisions, trade-offs, and how the spec is realized in code.**

---

## 1. Build system

`pom.xml` adds:

- `spring-boot-starter-web` — WebSocket needs Servlet support; the
  service has no REST endpoints but the embedded Tomcat is the
  WebSocket transport.
- `spring-boot-starter-websocket` — STOMP messaging.
- `spring-boot-starter-actuator` — health probes.
- `spring-kafka` — `@KafkaListener`.
- `spring-boot-starter-data-jpa` + `org.postgresql:postgresql` —
  alert history.
- `com.h2database:h2` (test) — unit tests for the alert path.
- `spring-kafka-test` (test) — embedded broker.

The service has **no `spring-boot-starter-security`** — it sits
behind the api-gateway in the sense that the front-end never hits
it directly. The WebSocket handshake is open. A future change adds
JWT validation on the WebSocket channel.

## 2. Module layout

```
alert-processing-service/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/java/com/johndeere/agrio/alert/
    │   ├── AlertProcessingApplication.java
    │   ├── domain/
    │   │   ├── model/
    │   │   │   ├── Alert.java
    │   │   │   ├── AlertSeverity.java
    │   │   │   └── TelemetryData.java
    │   │   └── service/
    │   │       └── AlertEvaluatorService.java
    │   ├── usecase/
    │   │   └── EvaluateTelemetryAlertUseCase.java
    │   ├── infrastructure/
    │   │   ├── kafka/
    │   │   │   ├── ProcessedTelemetryConsumer.java
    │   │   │   └── TelemetryMessage.java          # Jackson DTO
    │   │   ├── websocket/
    │   │   │   ├── WebSocketConfig.java
    │   │   │   └── AlertWebSocketPublisher.java
    │   │   └── persistence/
    │   │       ├── AlertEntity.java
    │   │       ├── AlertJpaRepository.java
    │   │       └── AlertEntityMapper.java
    │   └── adapters/
    │       └── dto/AlertDTO.java
    └── test/java/com/johndeere/agrio/alert/
        ├── domain/service/AlertEvaluatorServiceTest.java
        ├── usecase/EvaluateTelemetryAlertUseCaseTest.java
        └── infrastructure/ProcessedTelemetryConsumerTest.java
```

## 3. Domain layer (no Spring / JPA / Kafka / WebSocket)

- `TelemetryData` — flat POJO `(equipmentId, timestamp, engineTemp,
  rpm, fuelLevel, speed)`. The spec's `AlertEvaluatorService` uses
  flat getters, so the domain is flat by design.
- `AlertSeverity` — enum `INFO` / `WARNING` / `CRITICAL`.
- `Alert` — immutable value object. The alert id is a UUIDv4.
- `AlertEvaluatorService` — pure rule engine. The two thresholds
  are `public static final` doubles for testability and visibility.

## 4. Mapping the Kafka payload to the domain

The Kafka payload shape is the same `TelemetryPayload` produced by
`telemetry-ingestion-service`. We do **not** import the source
service's class (that would couple the two services). Instead:

1. `TelemetryMessage` (record, in `infrastructure.kafka`) is a
   nested-shape Jackson DTO matching the source service's JSON.
2. `ProcessedTelemetryConsumer` deserialises into `TelemetryMessage`
   and maps to the flat domain `TelemetryData`.

This keeps the domain POJO framework-free and protects the alert
service from changes to the source service's wire format that
would not break the alert rules.

## 5. Use case

`EvaluateTelemetryAlertUseCase.execute(telemetry)` does:

1. `AlertEvaluatorService.evaluate(telemetry)` → `Optional<Alert>`.
2. If present:
   - `AlertEntityMapper` converts domain `Alert` to JPA `AlertEntity`.
   - `AlertJpaRepository.save(entity)` persists.
   - `AlertWebSocketPublisher.publishAlert(dto)` publishes the
     STOMP frame.
3. Each side-effect is best-effort and independent: a Postgres
   outage does not stop the WebSocket publish and vice versa.

## 6. WebSocket layer

- `WebSocketConfig` implements
  `WebSocketMessageBrokerConfigurer` (Spring 6 / Spring Boot 3.x
  replaces the deprecated abstract base class):
  - `registerStompEndpoints` registers `/ws` with SockJS.
  - `configureMessageBroker` enables a simple in-memory broker on
    `/topic` and sets the application destination prefix to
    `/app`.
- `AlertWebSocketPublisher` is a thin wrapper around
  `SimpMessagingTemplate.convertAndSend("/topic/alerts", dto)`.

## 7. Persistence

`AlertEntity` mirrors the table in `spec.md §5`. The
`AlertEntityMapper` translates the domain `Alert` to the entity
field-by-field.

The `id` column is a string (UUIDv4) — we do **not** use the
auto-generated numeric id pattern, because the alert id is also
broadcast on the WebSocket and must be stable across the wire.

## 8. Configuration profiles

`application.yml` declares:

- **default** — H2 in-memory, no real Kafka (use `@EmbeddedKafka`
  in tests).
- **docker** — PostgreSQL + Kafka on the compose network.
- **test** — H2 + embedded broker.

## 9. Testing strategy

- **`AlertEvaluatorServiceTest`** — unit, 4 cases (CRITICAL,
  WARNING, normal, edge).
- **`EvaluateTelemetryAlertUseCaseTest`** — unit with mocks, 3
  cases (alert persisted and published, no alert, partial failure).
- **`ProcessedTelemetryConsumerTest`** — `@SpringBootTest` +
  `@EmbeddedKafka`, 2 cases (valid message triggers use case;
  malformed message is logged and skipped).

## 10. Open questions / follow-ups

| Question                                                       | Owner           | Tracked in           |
|----------------------------------------------------------------|-----------------|----------------------|
| JWT-protected WebSocket handshake                              | Platform Eng.   | Future change        |
| Rule thresholds moved to a config service                      | Platform Eng.   | Future change        |
| Alert storm control (rate-limit + dedup)                       | Platform Eng.   | Future change        |
| Flyway migrations (replace ddl-auto=update)                    | Platform Eng.   | Future change        |
| Alert history REST endpoint                                    | Front-end / API | Future change        |
