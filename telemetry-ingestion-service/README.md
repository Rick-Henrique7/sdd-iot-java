# telemetry-ingestion-service

**Status:** scaffold only — implementation tracked in **Change 003**.

## Responsibility
Consumes `agri.telemetry.raw` from Kafka, writes the latest state to
Redis (O(1) read), persists history in PostgreSQL (schema `telemetry`)
in batches, and republishes sanitized events to
`agri.telemetry.processed` for the alert engine.

## Source of truth
- Spec: `docs/backend/microservices-specification/telemetry-ingestion-service.md`
- Change artifacts: `changes/003-telemetry-ingestion-service/` (TBD)

## Key contracts
- Kafka input: `agri.telemetry.raw`
- Kafka output: `agri.telemetry.processed`
- Redis keys: `telemetry:latest:<equipmentId>` (TTL configurable)
- PostgreSQL schema: `telemetry`

## Module layout (planned)
```
telemetry-ingestion-service/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/java/com/johndeere/agrio/telemetry/
    │   ├── TelemetryIngestionApplication.java
    │   ├── domain/model/TelemetryPayload.java
    │   ├── usecase/ProcessTelemetryUseCase.java
    │   ├── infrastructure/kafka/ (Consumer + Producer)
    │   ├── infrastructure/redis/LatestStateRepository.java
    │   ├── infrastructure/persistence/ (Entity + JpaRepository)
    │   └── adapters/dto/TelemetryDTO.java
    └── test/
```
