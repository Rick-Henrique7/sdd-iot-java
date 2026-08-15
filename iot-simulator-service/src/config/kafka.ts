import { Kafka, logLevel } from 'kafkajs';

/**
 * Creates a KafkaJS client for the iot-simulator-service.
 * Pulled out of `index.ts` so tests can mock the producer
 * without touching the network layer.
 */
export function createKafka(broker: string): Kafka {
  return new Kafka({
    clientId: 'iot-simulator',
    brokers: [broker],
    logLevel: logLevel.WARN,
    retry: { retries: 5, initialRetryTime: 300 },
    connectionTimeout: 10_000,
  });
}
