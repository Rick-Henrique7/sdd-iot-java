# Tasks — Change 003: telemetry-ingestion-service

> **Implementation checklist. Each task is small, testable, and ends with a verifiable artifact.**

Format: `[ ]` not started · `[~]` in progress · `[x]` done

---

## 1. SDD artifacts

- [x] `changes/003-telemetry-ingestion-service/proposal.md`
- [x] `changes/003-telemetry-ingestion-service/spec.md`
- [x] `changes/003-telemetry-ingestion-service/design.md`
- [x] `changes/003-telemetry-ingestion-service/tasks.md`

## 2. Build & module wiring

- [x] `<module>telemetry-ingestion-service</module>` already in parent `pom.xml`.
- [x] `telemetry-ingestion-service/pom.xml` with web, actuator, kafka, jpa, redis, validation, jjwt? (no jjwt here).

## 3. Domain (no Spring / JPA / Kafka / Redis)

- [x] `domain/model/GpsCoordinates.java`.
- [x] `domain/model/TelemetryMetrics.java`.
- [x] `domain/model/TelemetryPayload.java`.

## 4. Use case

- [x] `usecase/ProcessTelemetryUseCase.java`.

## 5. Infrastructure

- [x] `infrastructure/kafka/TelemetryConsumer.java` (with `@KafkaListener`).
- [x] `infrastructure/kafka/TelemetryProducer.java`.
- [x] `infrastructure/redis/LatestStateRepository.java`.
- [x] `infrastructure/persistence/TelemetryEntity.java` (schema `telemetry`).
- [x] `infrastructure/persistence/TelemetryJpaRepository.java`.

## 6. Adapters

- [x] `adapters/dto/TelemetryDTO.java`.

## 7. Configuration

- [x] `application.yml` (default + docker + test profiles).

## 8. Tests

- [x] `ProcessTelemetryUseCaseTest` — unit, 3 cases.
- [x] `TelemetryConsumerTest` — `@SpringBootTest` + `@EmbeddedKafka`, 2 cases.

## 9. Container

- [x] `Dockerfile` (multi-stage, non-root, JRE 17 alpine).

## 10. Docker compose

- [x] Uncomment the `telemetry-ingestion-service` block in `docker-compose.yml`.

## 11. Validation

- [x] `.\mvnw.cmd -pl telemetry-ingestion-service -am test` is green.
- [x] `docker compose build telemetry-ingestion-service` succeeds.
- [x] `docker compose up -d telemetry-ingestion-service` brings the service up healthy.
- [x] End-to-end: produce one message to `agri.telemetry.raw` and see it in Redis + Postgres + `agri.telemetry.processed`.

## 12. Archive

- [ ] After all validation passes, move `changes/003-telemetry-ingestion-service/` to `changes/archive/2026-08-15-003-telemetry-ingestion-service/`.

---

## Acceptance checklist (final go/no-go)

- [ ] No code under `domain/` references Spring, JPA, Kafka, or Redis.
- [ ] All tests pass.
- [ ] Docker image builds and runs as non-root.
- [ ] End-to-end: raw → Redis + Postgres + processed topic.
