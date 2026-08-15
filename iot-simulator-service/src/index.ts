/**
 * iot-simulator-service — orchestrator.
 *
 * Connects to Apache Kafka, then loops over a small fleet of fake
 * equipment and publishes one telemetry message per machine per
 * tick to the `agri.telemetry.raw` topic.
 *
 * The generator is pure (`./generator/telemetryGenerator.ts`); this
 * file only wires the IO.
 */
import { createKafka } from './config/kafka';
import { TelemetryGenerator } from './generator/telemetryGenerator';

const BROKER = process.env.KAFKA_BROKER || 'kafka:29092';
const TOPIC = process.env.KAFKA_TOPIC || 'agri.telemetry.raw';
const INTERVAL_MS = Number(process.env.SIM_INTERVAL_MS || 1000);
const CLIENT_ID = process.env.SIM_CLIENT_ID || 'iot-simulator';

async function main(): Promise<void> {
  const kafka = createKafka(BROKER);
  const producer = kafka.producer({
    allowAutoTopicCreation: true,
    idempotent: false,
  });

  // Retry forever on the initial connect (Kafka may take a few
  // seconds to come up in `docker compose up`).
  await connectWithRetry(producer);

  console.log(`[iot-simulator] connected to ${BROKER}, topic=${TOPIC}, ` +
              `interval=${INTERVAL_MS}ms`);

  const gen = new TelemetryGenerator();
  const tick = async (): Promise<void> => {
    try {
      const messages = gen.fleet().map((machine) => {
        const payload = gen.next(machine);
        return {
          key: machine.id,
          value: JSON.stringify(payload),
        };
      });
      await producer.send({ topic: TOPIC, messages });
    } catch (err) {
      console.error('[iot-simulator] send failed', err);
    }
  };

  // Fire one immediately so a fresh consumer doesn't have to wait
  // a full interval for the first emission.
  await tick();
  const handle = setInterval(() => { void tick(); }, INTERVAL_MS);

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[iot-simulator] ${signal} received, shutting down`);
    clearInterval(handle);
    try {
      await producer.disconnect();
    } catch (err) {
      console.error('[iot-simulator] disconnect failed', err);
    }
    process.exit(0);
  };
  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT',  () => { void shutdown('SIGINT');  });
}

async function connectWithRetry(
  producer: ReturnType<ReturnType<typeof createKafka>['producer']>,
  maxAttempts = 30,
  delayMs = 2000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await producer.connect();
      return;
    } catch (err) {
      console.warn(`[iot-simulator] connect attempt ${attempt}/${maxAttempts} ` +
                   `failed: ${(err as Error).message}`);
      if (attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

main().catch((err) => {
  console.error('[iot-simulator] fatal', err);
  process.exit(1);
});
