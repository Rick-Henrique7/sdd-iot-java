# Change 006 — `iot-simulator-service` — Proposal

## Why
The whole platform pipeline (`auth → telemetry-ingestion → alert-processing`)
needs a steady stream of telemetry to exercise end-to-end. Without a producer
we have to hand-craft each Kafka message and click "send" in a console.
That works for the first demo, but every new feature on top of the stream
(tests, dashboards, alert rules, anomaly detection) needs a producer that
runs unattended.

The existing spec at
`docs/backend/microservices-specification/iot-flet-simulator.md` already
calls for a Node.js / KafkaJS simulator that publishes synthetic telemetry
to `agri.telemetry.raw` with stochastic anomaly injection. The directory
`iot-simulator-service/` is scaffolded but empty (placeholder only).

## What
Ship `iot-simulator-service`: a small Node.js 20 + TypeScript program that
loops over a small fleet of fake equipment, walks each one around a starting
GPS coordinate, occasionally injects an `engineTemp > 95°C` (or `rpm > 2500`)
anomaly to trip the alert pipeline, and publishes one JSON message per
emission to `agri.telemetry.raw`.

This change **closes the loop** of Changes 003 (telemetry-ingestion-service
consumes `agri.telemetry.raw`) and 004 (alert-processing-service evaluates
`agri.telemetry.processed`). After this lands, a `docker compose up` of
the whole stack produces alerts without any human in the loop.

## Non-goals
- **No historical storage** — the simulator does not write to Postgres.
  Persistence is already done by `telemetry-ingestion-service`.
- **No web UI / REST API** — it's a producer daemon, not a service.
- **No multi-region / cloud deployment** — local `docker compose` is enough.
- **No protocol re-negotiation** — only the JSON shape defined in the spec.

## Affected layers
- **New service** `iot-simulator-service/` (Node.js + TypeScript).
- **`docker-compose.yml`** — enable the iot-simulator-service block.
- **`.github/workflows/docker-image.yml`** — already added in the
  previous CI fix; no further change needed.
- **`init.sql`** — no schema change; simulator does not touch Postgres.

## Out of scope
- Frontend (separate change set, after all backend services ship).
- Replacing this simulator with a real device fleet later — the JSON
  contract on the topic is the contract that matters.
