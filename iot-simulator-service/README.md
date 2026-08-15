# iot-simulator-service

Node.js / TypeScript producer of **synthetic IoT telemetry** for the
Agro-IoT Integrated Platform. Implemented in **Change 006**.

## What it does

Every 1 s the service emits one JSON message per equipment (3 machines by
default) to the Kafka topic `agri.telemetry.raw`. Each emission has a 5 %
chance of being an **anomaly** — either `engineTemp > 95 °C` or `rpm > 2500`
— to exercise the alert pipeline.

```json
{
  "equipmentId": "TRAC-7230J-001",
  "timestamp":   "2026-08-15T21:55:00.123Z",
  "gps":         { "latitude": -21.1704, "longitude": -47.8103 },
  "metrics":     { "engineTemp": 87.3, "rpm": 1942, "fuelLevel": 74.5, "speed": 13.8 }
}
```

The full wire contract is in `changes/006-iot-simulator-service/spec.md`.

## Run

```bash
# tests
npm test

# build
npm run build

# local run (against Kafka on localhost:9092)
KAFKA_BROKER=localhost:9092 npm start

# via docker compose (against Kafka in the agrio-network)
docker compose up -d iot-simulator-service
docker logs -f agrio-iot-simulator
```

## Configuration

| Env var             | Default              | Meaning                          |
|---------------------|----------------------|----------------------------------|
| `KAFKA_BROKER`      | `kafka:29092`        | Kafka bootstrap server           |
| `KAFKA_TOPIC`       | `agri.telemetry.raw` | Target topic                     |
| `SIM_INTERVAL_MS`   | `1000`               | Time between emission ticks (ms) |
| `SIM_CLIENT_ID`     | `iot-simulator`      | KafkaJS client id                |

## Layout

```
iot-simulator-service/
├── Dockerfile
├── package.json
├── tsconfig.json
├── .dockerignore
└── src/
    ├── index.ts                        # orchestrator
    ├── config/kafka.ts                 # KafkaJS client factory
    └── generator/
        ├── telemetryGenerator.ts       # pure generator (no IO)
        └── telemetryGenerator.test.ts  # node:test unit tests (4 cases)
```

The `generator/` package is **pure** (no Kafka, no IO, no `Date.now` in
the hot path), which keeps the unit tests fast and deterministic.
