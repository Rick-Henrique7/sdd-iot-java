# Change 006 — `iot-simulator-service` — Design

## Component layout

```
iot-simulator-service/
├── package.json          # kafkajs + typescript + scripts
├── tsconfig.json         # strict, ES2022, commonjs, outDir=dist
├── Dockerfile            # multi-stage node:20-alpine, non-root
├── .dockerignore         # node_modules, dist, .git, etc.
├── README.md             # how to run, what it produces
└── src/
    ├── index.ts                       # orchestrator (entry)
    ├── config/
    │   └── kafka.ts                   # Kafka client factory
    └── generator/
        └── telemetryGenerator.ts      # pure function over a fleet
```

The split keeps the **pure** parts (`telemetryGenerator`) free of any
Kafka / IO / framework dependency, so the unit tests can run them
without booting Kafka.

## `src/generator/telemetryGenerator.ts`

A `TelemetryGenerator` class that owns the fleet state (the walking GPS
coordinates mutate over time) and exposes two methods:

```ts
class TelemetryGenerator {
  constructor(opts: { seed?: number; anomalyRate?: number })
  next(machine: Machine): TelemetryPayload
  fleet(): ReadonlyArray<Machine>
}
```

- `next(machine)` produces a single payload, mutating `machine.baseLat`
  / `machine.baseLng` by a small random delta each call.
- The RNG is pluggable so tests can pass a seeded implementation. In
  production the default uses `Math.random` (no deps).
- `anomalyRate` defaults to `0.05`. A helper `isAnomaly()` returns
  `true` with that probability.
- The wire shape mirrors the spec exactly. We do **not** import the
  Java DTOs from the other services — the JSON contract is the only
  thing that crosses the Kafka boundary, and the Java side already
  parses with Jackson and ignores unknown fields.

## `src/config/kafka.ts`

A tiny factory:

```ts
import { Kafka, logLevel } from 'kafkajs';

export function createKafka(broker: string): Kafka {
  return new Kafka({
    clientId: 'iot-simulator',
    brokers: [broker],
    logLevel: logLevel.WARN,
    retry: { retries: 5, initialRetryTime: 300 }
  });
}
```

Pulled out of `index.ts` so tests can mock the producer without
touching network code.

## `src/index.ts`

The orchestrator. ~30 lines:

```ts
import { createKafka } from './config/kafka';
import { TelemetryGenerator } from './generator/telemetryGenerator';

const BROKER = process.env.KAFKA_BROKER || 'kafka:29092';
const INTERVAL_MS = Number(process.env.SIM_INTERVAL_MS || 1000);

async function main() {
  const kafka = createKafka(BROKER);
  const producer = kafka.producer({ allowAutoTopicCreation: true });
  await producer.connect();
  console.log(`[iot-simulator] connected to ${BROKER}`);

  const gen = new TelemetryGenerator();
  setInterval(async () => {
    for (const machine of gen.fleet()) {
      const payload = gen.next(machine);
      await producer.send({
        topic: 'agri.telemetry.raw',
        messages: [{ key: machine.id, value: JSON.stringify(payload) }]
      });
    }
  }, INTERVAL_MS);
}

main().catch((err) => {
  console.error('[iot-simulator] fatal', err);
  process.exit(1);
});
```

A `SIGTERM` / `SIGINT` handler disconnects the producer cleanly so the
container can stop in < 5 s.

## Tests (`src/generator/telemetryGenerator.test.ts`)

`node:test` (built-in, zero deps) + `assert/strict`. Four cases:

1. **Anomaly temperature bound** — force `anomalyRate: 1` and assert
   `engineTemp > 95` on every payload (10 000 emissions).
2. **Anomaly rpm bound** — same with `rpm > 2500` forced.
3. **Wire shape** — emit 1 000 payloads, check every field against the
   rules table (lat in `[-90, 90]`, engineTemp `[60, 120]`, etc.).
4. **Determinism** — with `seed: 42`, the first 10 payloads of all
   machines are byte-equal between two `TelemetryGenerator` instances.

Run via `npm test`. No external services needed.

## Docker

Multi-stage `Dockerfile` based on `node:20-alpine`:

- **Builder** — `npm ci && npm run build` → `dist/`.
- **Runner** — `npm ci --omit=dev`, copies `dist/` and `package.json`,
  sets `USER node`, `CMD ["node", "dist/index.js"]`.

No exposed ports. `docker-compose.yml` entry:

```yaml
iot-simulator-service:
  build:
    context: .
    dockerfile: iot-simulator-service/Dockerfile
  container_name: agrio-iot-simulator
  environment:
    - KAFKA_BROKER=kafka:29092
    - SIM_INTERVAL_MS=1000
  depends_on:
    kafka:
      condition: service_healthy
  restart: unless-stopped
  networks:
    - agrio-network
```

The existing CI image workflow already lists
`iot-simulator-service` in the matrix (added in the last CI fix), so
the image is published to GHCR automatically on every push to `main`.

## What is **not** changed
- `init.sql` — simulator does not write to Postgres.
- `pom.xml` — this is a Node service, not a Maven module.
- `ci.yml` — `mvnw -fae verify` only sees the Maven reactor; Node
  code is exercised through the Docker image workflow.
- `fleet-mapping-service`, `telemetry-ingestion-service`,
  `alert-processing-service` — unchanged.
