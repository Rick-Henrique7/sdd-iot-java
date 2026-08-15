# Proposal — Change 003: telemetry-ingestion-service

> **Why this change exists. The problem we are solving and the value it unlocks.**

---

## Context

The IoT simulator (Change 006, not yet started) and any real
fleet hardware publish telemetry packets to Kafka. Today, no service
*consumes* that topic — the platform is end-to-end silent on the
ingestion side. As a result:

- The **Redis latest-state cache** that the `api-gateway` and
  `alert-processing-service` rely on is empty.
- The **`agri.telemetry.processed`** topic that the alert engine
  subscribes to never receives messages.
- The **telemetry history** in PostgreSQL is never written.

The `docs/backend/microservices-specification/telemetry-ingestion-service.md`
already defines the contract for the service that fills this gap. It
has been waiting for an implementation.

## Goal

Introduce the **`telemetry-ingestion-service`** as the single point
of ingestion for the entire platform. It MUST:

1. Consume `agri.telemetry.raw` with a `@KafkaListener`.
2. Update the Redis latest-state cache (`telemetry:latest:<equipmentId>`)
   on every message — O(1) read for the front-end dashboard.
3. Persist the historical record to PostgreSQL (schema `telemetry`)
   via JPA. The spec calls for *batched* writes; this change lands the
   happy path and leaves room for batch-tuning in a follow-up.
4. Republish the sanitized payload to `agri.telemetry.processed` so
   the `alert-processing-service` (Change 004) can pick it up.
5. Follow Clean Architecture: the domain must not import Spring,
   JPA, Kafka, or Redis APIs.

## Non-Goals

- Exposing any REST endpoint. The service is a pure background worker.
- Running Testcontainers. The test suite uses H2 + an embedded
  Kafka broker (Testcontainers is a follow-up; see Design §6).
- Distributed tracing, metrics, or rate-limiting. Tracked as
  follow-ups.

## Success Criteria

- `mvn -pl telemetry-ingestion-service -am test` is green.
- The fat jar builds and the Docker image is produced.
- A live `agri.telemetry.raw` message published from the
  `iot-simulator-service` (Change 006) lands in the Redis
  cache AND in the PostgreSQL `telemetry` schema AND in the
  `agri.telemetry.processed` topic, end-to-end.
- A REST smoke probe against the actuator health endpoint returns
  `200 UP` while the service is consuming.
- The domain layer does not import Spring, JPA, Kafka, or JJWT.

## Risks

| Risk                                                              | Mitigation                                                |
|-------------------------------------------------------------------|-----------------------------------------------------------|
| Bad JSON from the simulator crashes the consumer                 | Catch + push to a DLQ topic; consumer stays up            |
| Domain layer leaking framework code                              | Code review + the validation checklist in `tasks.md`      |
| Redis hot-key imbalance (one equipment flooding)                  | Redis O(1) SET; acceptable for the platform size         |
| Postgres write amplification on burst traffic                     | JPA `save()` per message today; batch tuning is follow-up |

## Stakeholders

- Platform Engineering — owns the ingestion tier.
- Front-end Team — consumes the Redis cache via the api-gateway.
- Alert Processing — depends on `agri.telemetry.processed` (Change 004).
- IoT Simulator — produces `agri.telemetry.raw` (Change 006).
