# iot-simulator-service

**Status:** scaffold only — implementation tracked in **Change 006**.

## Responsibility
Generates and publishes synthetic IoT telemetry to Kafka topic
`agri.telemetry.raw`, simulating a fleet of agricultural machines
moving across field coordinates. Can inject anomalies
(`engineTemp > 95°C`, RPM surges) to validate the alert engine.

## Source of truth
- Spec: `docs/backend/microservices-specification/iot-flet-simulator.md`
- Change artifacts: `changes/006-iot-simulator-service/` (TBD)

## Key contracts
- Kafka topic: `agri.telemetry.raw`
- Emission cadence: 1 message per machine per second (configurable)
- Anomaly injection: 5% chance per emission (configurable)

## Module layout (planned)
```
iot-simulator-service/
├── package.json
├── tsconfig.json
├── Dockerfile
└── src/
    ├── config/kafka.ts
    ├── generator/telemetryGenerator.ts
    └── index.ts
```
