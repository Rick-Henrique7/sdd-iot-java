# alert-processing-service

**Status:** scaffold only — implementation tracked in **Change 004**.

## Responsibility
Consumes `agri.telemetry.processed` from Kafka, evaluates rule
thresholds (`AlertEvaluatorService`), persists `AlertEntity` rows to
PostgreSQL, and pushes real-time notifications to the Next.js
front-end via STOMP `/topic/alerts`.

## Source of truth
- Spec: `docs/backend/microservices-specification/alert-processing-service.md`
- Change artifacts: `changes/004-alert-processing-service/` (TBD)

## Key contracts
- WebSocket destination: `/topic/alerts`
- Alert severities: `INFO`, `WARNING`, `CRITICAL`
- Rule thresholds: `engineTemp > 95°C` (CRITICAL), `rpm > 2500` (WARNING)

## Module layout (planned)
```
alert-processing-service/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/java/com/johndeere/agrio/alert/
    │   ├── AlertProcessingApplication.java
    │   ├── domain/ (Alert, AlertSeverity, TelemetryData, AlertEvaluatorService)
    │   ├── usecase/EvaluateTelemetryAlertUseCase.java
    │   ├── infrastructure/kafka/ProcessedTelemetryConsumer.java
    │   ├── infrastructure/websocket/ (Config + Publisher)
    │   ├── infrastructure/persistence/ (Entity + JpaRepository)
    │   └── adapters/dto/AlertDTO.java
    └── test/
```
