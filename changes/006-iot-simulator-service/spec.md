# Change 006 — `iot-simulator-service` — Spec

## Functional requirements

1. **Continuous emission.** The service connects to Apache Kafka once on
   startup and emits one telemetry message per equipment per second
   (`1 Hz × N machines`).
2. **Fleet.** The simulator carries a small hard-coded fleet of at least
   three machines with distinct `id`, starting GPS and (optionally)
   machine type, so a downstream consumer sees key diversity.
3. **GPS walk.** For each emission the latitude/longitude of a machine
   is the previous point plus a small random delta
   (`±0.0001°` per step). The path stays in a believable area.
4. **Anomaly injection.** Each emission has a 5 % chance of being an
   anomaly. An anomaly either:
   - raises `metrics.engineTemp` to `97.8°C` (target > 95 °C), or
   - raises `metrics.rpm` to `2700` (target > 2500 rpm).
   The two are picked independently at random; both can fire on the same
   emission.
5. **Normal range.** When not anomalous, `engineTemp` is in `[85.0, 90.0)`
   °C, `rpm` in `[1800, 2200)`, `fuelLevel` in `[70.0, 90.0)` % and
   `speed` in `[12.0, 16.0)` km/h. All numbers are rounded to 1 decimal
   place except `rpm` (integer).
6. **Wire shape.** Every message is JSON, with the exact field names
   below, encoded as UTF-8 string. The Kafka key is the `equipmentId`
   so that all emissions from one machine land on the same partition.

### Wire format (per message)

```json
{
  "equipmentId": "TRAC-7230J-001",
  "timestamp": "2026-08-15T21:55:00.123Z",
  "gps": {
    "latitude":  -21.1704,
    "longitude": -47.8103
  },
  "metrics": {
    "engineTemp": 87.3,
    "rpm":        1942,
    "fuelLevel":  74.5,
    "speed":      13.8
  }
}
```

| Field          | Type    | Rule                              |
|----------------|---------|-----------------------------------|
| `equipmentId`  | string  | non-empty, matches `[A-Z0-9-]+`   |
| `timestamp`    | string  | ISO-8601 UTC, includes ms         |
| `gps.latitude` | number  | `[-90, 90]`                       |
| `gps.longitude`| number  | `[-180, 180]`                     |
| `engineTemp`   | number  | `[60, 120]`, 1 decimal            |
| `rpm`          | integer | `[0, 4000]`                       |
| `fuelLevel`    | number  | `[0, 100]`, 1 decimal             |
| `speed`        | number  | `[0, 60]`, 1 decimal              |

### Topic and broker

- **Topic:** `agri.telemetry.raw`
- **Bootstrap:** `process.env.KAFKA_BROKER` (default `kafka:29092` inside
  Docker, `localhost:9092` outside).
- **Idempotence:** KafkaJS producer default is at-least-once with retries;
  `acks: -1` is used so the broker waits for all in-sync replicas.

## Non-functional requirements

1. **Resource budget.** ≤ 64 MB RSS at idle, ≤ 1 vCPU steady-state. This
   is a small producer, not a stream processor.
2. **Resilience.** On Kafka disconnect the producer logs a single
   warning and retries forever; it does **not** crash the container. A
   Docker `restart: unless-stopped` policy is set in `docker-compose.yml`.
3. **Logging.** A single line per emission at `info` level (`equipmentId`,
   `isAnomaly`, `engineTemp`, `rpm`). On error, `error` with the
   exception message.
4. **Container.** Multi-stage build, `node:20-alpine` on both stages, runs
   as non-root (`node` user, UID 1000). Final image exposes no ports
   (it's a producer).
5. **Configuration.** All knobs (broker, fleet, interval, anomaly rate)
   are either env vars or constants in the source — no external config
   file in this change.

## Acceptance criteria

1. `npm test` exits 0 with at least the following cases:
   - `engineTemp` of an anomaly is `> 95°C` 100 % of the time over
     10 000 emissions with the anomaly branch forced on.
   - `rpm` of an anomaly is `> 2500` 100 % of the time with the rpm
     branch forced on.
   - All emitted payloads validate against the wire-format rules
     above (use a helper, not JSON Schema).
   - Determinism: with a seeded RNG, the first 10 emissions of the
     fleet are byte-equal between runs.
2. `npm run build` produces a `dist/index.js` and `dist/**/*.js` from
   `src/**/*.ts` with no TypeScript errors.
3. `docker compose up -d iot-simulator-service` starts a healthy
   container; `docker logs agrio-iot-simulator` shows a "connected to
   Kafka" line and a stream of emission lines.
4. While running, `agri.telemetry.raw` gains ~3 messages / second
   (1 Hz × 3 machines), and `telemetry.telemetry_events` gains rows in
   the same cadence (verified via `SELECT COUNT(*)` on the table).
5. At least one row in `alert.alerts` is created within 60 s of the
   simulator starting (because anomalies fire ~5 %/s × 3 machines =
   one anomaly every ~7 s, well under 60 s).
