# Change 006 — `iot-simulator-service` — Tasks

## 1. SDD artifacts
- [x] `changes/006-iot-simulator-service/proposal.md`
- [x] `changes/006-iot-simulator-service/spec.md`
- [x] `changes/006-iot-simulator-service/design.md`
- [x] `changes/006-iot-simulator-service/tasks.md`

## 2. Source code
- [x] `iot-simulator-service/package.json` — add `kafkajs` and
      `typescript` deps + `test` / `build` scripts.
- [x] `iot-simulator-service/src/config/kafka.ts` — `createKafka` factory.
- [x] `iot-simulator-service/src/generator/telemetryGenerator.ts` —
      `TelemetryGenerator` class (pure, no IO).
- [x] `iot-simulator-service/src/index.ts` — orchestrator, setInterval,
      producer.send, SIGTERM handler.

## 3. Tests
- [x] `iot-simulator-service/src/generator/telemetryGenerator.test.ts`
      — 4 cases (anomaly temp, anomaly rpm, wire shape, determinism).
- [x] `npm install && npm test` → 4/4 pass locally.

## 4. Container
- [x] `iot-simulator-service/Dockerfile` — multi-stage `node:20-alpine`,
      `USER node`, `CMD ["node", "dist/index.js"]`.
- [x] `iot-simulator-service/.dockerignore` — exclude `node_modules`,
      `dist`, `.git`, `*.test.ts`, `coverage`.

## 5. Local stack
- [x] `docker-compose.yml` — replace the disabled iot-simulator block
      with the live one (KAFKA_BROKER, depends_on, restart policy).
- [x] `docker compose up -d iot-simulator-service` — container stays
      up; logs show "connected to kafka:29092" + emission lines.
- [x] `docker logs agrio-iot-simulator | head` — sanity check.

## 6. End-to-end validation
- [x] Produce messages: `kafkacat` / `kafka-console-consumer` against
      `kafka:29092` topic `agri.telemetry.raw` → messages arrive
      ~3/s.
- [x] Persistence: `SELECT COUNT(*) FROM telemetry.telemetry_events`
      grows at the same rate.
- [x] Alerts: `SELECT COUNT(*) FROM alert.alerts` rises within 60 s
      of the simulator starting (anomaly rate 5 % × 3 machines).

## 7. Repo plumbing
- [x] `iot-simulator-service/README.md` updated with the new
      behaviour (no more "placeholder").
- [x] `.github/workflows/docker-image.yml` already includes
      `iot-simulator-service` in the matrix (added in the previous CI
      fix); no further change required.

## 8. Git
- [x] Single commit: `feat(sim): ship Change 006 — iot-simulator-service`.
- [x] Push to `origin/main`.
- [x] CI run on the new commit → green.
- [x] Docker image run on the new commit → green; 5 images pushed
      (api-gateway, auth-service, telemetry-ingestion-service,
      alert-processing-service, fleet-mapping-service) + the new
      agrio-iot-simulator-service.
