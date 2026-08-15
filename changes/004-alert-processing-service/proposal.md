# Proposal — Change 004: alert-processing-service

> **Why this change exists. The problem we are solving and the value it unlocks.**

---

## Context

With Change 003 shipped, the platform now consumes `agri.telemetry.raw`,
updates Redis + PostgreSQL, and republishes the events to
`agri.telemetry.processed`. The pipeline is *complete up to the
alert boundary* — but nothing *consumes* the processed topic yet. As
a result:

- The next.js front-end never receives real-time alerts.
- No historical record of anomalies is kept for audit.
- The IoT operator is the last to know when a tractor overheats.

The `docs/backend/microservices-specification/alert-processing-service.md`
already defines the contract for the service that closes this loop.

## Goal

Introduce the **`alert-processing-service`** as the platform's
real-time anomaly detector and notifier. It MUST:

1. Consume `agri.telemetry.processed` with a `@KafkaListener`.
2. Evaluate the message against the rule engine
   (`AlertEvaluatorService`) — `engineTemp > 95°C` is
   `CRITICAL`, `rpm > 2500` is `WARNING`.
3. Persist every fired alert to PostgreSQL for audit.
4. Publish the alert to a STOMP topic (`/topic/alerts`) so the
   front-end (and any other WebSocket client) receives it in
   real time.
5. Follow Clean Architecture: the domain layer must not import
   Spring, JPA, Kafka, or WebSocket APIs.

## Non-Goals

- REST endpoint for historical alert queries (the front-end can read
  from a future `alert-history` service or via the api-gateway).
- Severity routing (paging, SMS, etc.). A future change will add
  adapters for each channel.
- Configurable rule thresholds via REST. The current rules are
  constants in the domain layer; future change moves them to a
  config service.

## Success Criteria

- `mvn -pl alert-processing-service -am test` is green.
- The fat jar builds and the Docker image is produced.
- A live `agri.telemetry.processed` message with `engineTemp > 95`
  produces (a) a row in `alert.alerts`, and (b) a WebSocket frame
  on `/topic/alerts` carrying the `AlertDTO`.
- A `engineTemp <= 95` message produces neither.
- The domain layer does not import Spring, JPA, Kafka, or
  WebSocket APIs.

## Risks

| Risk                                                              | Mitigation                                                |
|-------------------------------------------------------------------|-----------------------------------------------------------|
| WebSocket hangs the consumer on a slow client                      | STOMP is non-blocking on the producer side; clients subscribe on their own pace |
| Rule thresholds hard-coded                                        | Constants in domain for now; externalised in follow-up change |
| Alert storm (one bad sensor → thousands of alerts)               | Idempotency / dedup is a follow-up; this change accepts the risk |
| Domain layer leaking framework code                              | Code review + the validation checklist in `tasks.md`      |

## Stakeholders

- Platform Engineering — owns the alert tier.
- Front-end Team — receives alerts on the dashboard.
- IoT Operator — primary human beneficiary.
- Operations — owns rule configuration when it becomes external.
