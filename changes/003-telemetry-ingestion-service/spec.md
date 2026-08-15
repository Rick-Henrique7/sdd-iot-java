# Spec — Change 003: telemetry-ingestion-service

> **Behavioral contract. What the telemetry-ingestion-service MUST do. This is the single source of truth for behavior.**

---

## 1. Kafka contract

| Side         | Topic                       | Encoding | Group                   |
|--------------|-----------------------------|----------|-------------------------|
| Input        | `agri.telemetry.raw`        | JSON     | `telemetry-ingestion-group` |
| Output       | `agri.telemetry.processed`  | JSON     | (no consumer group; fire-and-forget) |

A message is the **exact** `TelemetryPayload` JSON below, produced
by the `iot-simulator-service` (Change 006):

```json
{
  "equipmentId": "TRAC-7230J-001",
  "timestamp": "2026-08-15T12:00:00Z",
  "gps": { "latitude": -21.1704, "longitude": -47.8103 },
  "metrics": {
    "engineTemp": 92.5,
    "rpm": 2200,
    "fuelLevel": 78.3,
    "speed": 14.2
  }
}
```

Field renames are forbidden without a spec update + a new change.

## 2. Side effects per consumed message

For every successfully-parsed `TelemetryPayload`, the service MUST,
in this order:

1. **Redis latest state** — write the entire JSON payload at key
   `telemetry:latest:<equipmentId>` (no TTL by default; configurable
   via `telemetry.cache.ttl-seconds`).
2. **PostgreSQL history** — INSERT a row into
   `telemetry.telemetry_events` (table managed by JPA, schema
   described in Design §3.2).
3. **Kafka republished** — produce a JSON copy to
   `agri.telemetry.processed` using the same `equipmentId` as the
   message key, so downstream consumers see per-equipment ordering.

These three writes are *independent* and *idempotent at the domain
level*: re-delivering the same message from Kafka MUST NOT
duplicate alerts (the alert engine dedupes by `equipmentId +
timestamp`). This change does not enforce idempotency itself.

## 3. Failure handling

| Condition                              | Response                                  |
|----------------------------------------|-------------------------------------------|
| Malformed JSON                         | Log error, rethrow → consumer commits offset only after success. Producer does not receive a sanitized message. |
| Redis unreachable                      | Log error, continue; the SQL + Kafka path still runs (degraded mode). |
| Postgres unreachable                   | Log error, continue; the Redis + Kafka path still runs (degraded mode). |
| Kafka producer unavailable              | Log error, rethrow → message is re-delivered. |
| Unknown internal error                  | Log + rethrow → re-delivery. |

A future change will introduce a Dead-Letter Queue (DLQ) for messages
that fail parsing N times. For now, malformed messages are simply
logged and skipped at the offset level (the consumer wraps the body
in a try/catch and only commits offsets for the success path).

## 4. Non-functional requirements

| NFR                | Target                                                       |
|--------------------|--------------------------------------------------------------|
| Throughput         | ≥ 5,000 events/s on a `2 vCPU / 2 GiB` instance              |
| Latency p99        | < 50 ms from consume to Redis update                         |
| Cold memory        | < 256 MiB RSS at idle                                        |
| Container security | Non-root user, JRE 17 alpine, multi-stage build              |

## 5. Health & observability

- `/actuator/health` returns `200 UP` when the service is connected
  to Kafka, Redis, and Postgres.
- `/actuator/health/liveness` and `/actuator/health/readiness`
  exposed for Kubernetes probes.

## 6. Acceptance criteria

1. `mvn -pl telemetry-ingestion-service -am test` builds and all
   unit + integration tests pass.
2. The fat jar is produced and a Docker image can be built.
3. With the full docker-compose stack up, a message published to
   `agri.telemetry.raw` from any Kafka client appears in:
   - Redis at `telemetry:latest:<equipmentId>` (TTL as configured)
   - The `telemetry.telemetry_events` table
   - The `agri.telemetry.processed` topic
4. A malformed message is logged and the consumer keeps running.
5. The domain layer (`domain/`) does not import Spring, JPA, Kafka,
   or JJWT.
