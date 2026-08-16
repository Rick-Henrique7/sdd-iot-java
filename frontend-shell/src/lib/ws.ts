import { Client, type IMessage } from '@stomp/stompjs';

/**
 * Base URL of the STOMP broker. Defaults to the alert-processing
 * service on port 8082 (the only service that currently runs a
 * STOMP broker in this stack — see `WebSocketConfig`).
 *
 * Set `NEXT_PUBLIC_WS_BASE_URL` in the environment to override
 * (e.g. `ws://alert-processing-service:8082/ws` inside docker).
 */
const WS_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? 'ws://localhost:8082/ws';

/**
 * Creates a STOMP client wired to the Agro-IoT broker.
 *
 * - The broker is plain WebSocket (no SockJS), so the
 *   `webSocketFactory` just returns a `new WebSocket(WS_URL)`.
 *   We pass it explicitly so the `Client` doesn't try to
 *   auto-derive a factory from `brokerURL` (which on the
 *   browser works fine but keeps the surface area smaller).
 * - Heartbeats are 10s in / 10s out so dead connections are
 *   detected within ~30s.
 * - Reconnect delay is 2s — fast enough to feel "live", slow
 *   enough to not hammer the broker when the server is down.
 */
export function createWsClient(_token: string | null): Client {
  return new Client({
    brokerURL: WS_URL,
    reconnectDelay: 2_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    webSocketFactory: () => new WebSocket(WS_URL),
  });
}

/**
 * Subscribes to a STOMP topic. Returns the unsubscribe function
 * so callers can clean up on unmount.
 */
export function subscribe(
  client: Client,
  topic: string,
  cb: (msg: IMessage) => void,
): () => void {
  const sub = client.subscribe(topic, cb);
  return () => sub.unsubscribe();
}

/** Re-exported for diagnostics in the browser console. */
export const WS_DIAGNOSTICS = { url: WS_URL };
