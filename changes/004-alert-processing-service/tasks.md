# Tasks — Change 004: alert-processing-service

> **Implementation checklist. Each task is small, testable, and ends with a verifiable artifact.**

Format: `[ ]` not started · `[~]` in progress · `[x]` done

---

## 1. SDD artifacts

- [x] `changes/004-alert-processing-service/proposal.md`
- [x] `changes/004-alert-processing-service/spec.md`
- [x] `changes/004-alert-processing-service/design.md`
- [x] `changes/004-alert-processing-service/tasks.md`

## 2. Build & module wiring

- [x] `<module>alert-processing-service</module>` already in parent `pom.xml`.
- [x] `alert-processing-service/pom.xml` with web, websocket, kafka, jpa, actuator.

## 3. Domain (no Spring / JPA / Kafka / WebSocket)

- [x] `domain/model/AlertSeverity.java` — enum.
- [x] `domain/model/TelemetryData.java` — flat POJO.
- [x] `domain/model/Alert.java` — immutable value object.
- [x] `domain/service/AlertEvaluatorService.java` — pure rule engine.

## 4. Use case

- [x] `usecase/EvaluateTelemetryAlertUseCase.java`.

## 5. Infrastructure

- [x] `infrastructure/kafka/TelemetryMessage.java` — nested Jackson DTO.
- [x] `infrastructure/kafka/ProcessedTelemetryConsumer.java`.
- [x] `infrastructure/websocket/WebSocketConfig.java`.
- [x] `infrastructure/websocket/AlertWebSocketPublisher.java`.
- [x] `infrastructure/persistence/AlertEntity.java`.
- [x] `infrastructure/persistence/AlertJpaRepository.java`.
- [x] `infrastructure/persistence/AlertEntityMapper.java`.

## 6. Adapters

- [x] `adapters/dto/AlertDTO.java`.

## 7. Configuration

- [x] `application.yml` (default + docker + test profiles).

## 8. Tests

- [x] `AlertEvaluatorServiceTest` — unit, 4 cases.
- [x] `EvaluateTelemetryAlertUseCaseTest` — unit, 3 cases.
- [x] `ProcessedTelemetryConsumerTest` — `@SpringBootTest` + `@EmbeddedKafka`, 2 cases.

## 9. Container

- [x] `Dockerfile` (multi-stage, non-root, JRE 17 alpine).

## 10. Docker compose

- [x] Uncomment the `alert-processing-service` block in `docker-compose.yml`.

## 11. Validation

- [x] `.\mvnw.cmd -pl alert-processing-service -am test` is green.
- [x] `docker compose build alert-processing-service` succeeds.
- [x] `docker compose up -d alert-processing-service` brings the service up healthy.
- [x] End-to-end: produce a `engineTemp > 95` message to `agri.telemetry.processed` and see it in Postgres + WebSocket.

## 12. Archive

- [ ] After all validation passes, move `changes/004-alert-processing-service/` to `changes/archive/2026-08-15-004-alert-processing-service/`.

---

## Acceptance checklist (final go/no-go)

- [ ] No code under `domain/` references Spring, JPA, Kafka, or WebSocket.
- [ ] All tests pass.
- [ ] Docker image builds and runs as non-root.
- [ ] End-to-end: processed topic → alert row + WebSocket frame.
