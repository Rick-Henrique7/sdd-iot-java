# Spec — Change 004: alert-processing-service

> **Behavioral contract. What the alert-processing-service MUST do. This is the single source of truth for behavior.**

---

## 1. Kafka contract

| Side         | Topic                       | Encoding | Group                       |
|--------------|-----------------------------|----------|-----------------------------|
| Input        | `agri.telemetry.processed`  | JSON     | `alert-processing-group`    |

The consumed JSON shape is the **exact** `TelemetryPayload` produced
by `telemetry-ingestion-service` (Change 003). Renames on the source
side are forbidden without a spec update.

## 2. Rule engine

The service evaluates each consumed message against two hard-coded
thresholds:

| Rule          | Threshold | Severity | Message template                                            |
|---------------|-----------|----------|-------------------------------------------------------------|
| `engineTemp`  | `> 95°C`  | `CRITICAL` | "Temperatura do motor acima do limite crítico seguro (X°C)." |
| `rpm`         | `> 2500`  | `WARNING`  | "Operação em rotação elevada (X RPM). Risco de desgaste prematuro." |

The rules are evaluated in the order above. The first match wins.
The domain layer exposes the constants as `public static final` for
visibility in tests.

## 3. Alert DTO (WebSocket contract)

Alerts are published to the STOMP topic `/topic/alerts` as JSON:

```json
{
  "alertId": "ALT-883921-2026",
  "equipmentId": "TRAC-7230J-001",
  "severity": "CRITICAL",
  "metricName": "engineTemp",
  "currentValue": 98.4,
  "thresholdValue": 95.0,
  "message": "Temperatura do motor acima do limite crítico seguro (98.4°C).",
  "timestamp": "2026-08-15T12:13:32Z"
}
```

- `alertId` — opaque UUIDv4 string.
- `timestamp` — ISO-8601 UTC instant, captured at the moment the
  alert was generated.

## 4. WebSocket transport

- **Endpoint:** `/ws` (with SockJS fallback).
- **Topic prefix:** `/topic`.
- **Application destination prefix:** `/app` (reserved for future
  client-to-server messages).
- **CORS** is delegated to the api-gateway. This service permits
  all origins for STOMP handshakes (the broker is behind the
  internal network).

## 5. Persistence

Alerts are stored in `alert.alerts`:

| Column         | Type                       | Notes                              |
|----------------|----------------------------|------------------------------------|
| `id`           | VARCHAR(64)                | PK, opaque UUIDv4                  |
| `equipment_id` | VARCHAR(64)                | NOT NULL                           |
| `severity`     | VARCHAR(16)                | NOT NULL (`INFO` / `WARNING` / `CRITICAL`) |
| `metric_name`  | VARCHAR(32)                | NOT NULL                           |
| `current_value`| DOUBLE PRECISION           | NOT NULL                           |
| `threshold_value` | DOUBLE PRECISION        | NOT NULL                           |
| `message`      | VARCHAR(512)               | NOT NULL                           |
| `created_at`   | TIMESTAMP WITH TIME ZONE   | NOT NULL DEFAULT now()             |

A future change introduces Flyway for versioned migrations. For now,
JPA `ddl-auto=update` creates the table on first boot.

## 6. Failure handling

| Condition                          | Response                          |
|------------------------------------|-----------------------------------|
| Malformed JSON                     | Log + skip (commit offset).       |
| Postgres unreachable               | Log + continue. The WebSocket publish still happens. |
| WebSocket broker not ready         | Log + continue. The Postgres write still happens.  |
| No rule matched                    | No DB write, no WebSocket publish. |

## 7. Health & observability

- `/actuator/health` returns `200 UP` when the service is connected
  to Kafka and Postgres.
- `/actuator/health/liveness` and `/actuator/health/readiness`
  exposed for Kubernetes probes.

## 8. Acceptance criteria

1. `mvn -pl alert-processing-service -am test` builds and all
   unit + integration tests pass.
2. The fat jar is produced and a Docker image can be built.
3. With the full docker-compose stack up, a published message on
   `agri.telemetry.processed` with `engineTemp > 95` produces a
   row in `alert.alerts` AND a STOMP frame on `/topic/alerts`.
4. A published message with `engineTemp <= 95` and `rpm <= 2500`
   produces neither.
5. The domain layer (`domain/`) does not import Spring, JPA, Kafka,
   or WebSocket APIs.
