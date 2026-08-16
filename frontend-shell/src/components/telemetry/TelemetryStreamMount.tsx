'use client';

import { useEffect } from 'react';
import { createWsClient, subscribe } from '@/lib/ws';
import { useAuthStore } from '@/stores/authStore';
import { useTelemetryStore } from '@/stores/telemetryStore';
import type { Alert } from '@/types/alert';
import type { TelemetryEvent } from '@/types/telemetry';

const DEBOUNCE_MS = 1_000;
/** How often the flush interval runs. 250 ms is fine-grained
 *  enough to never miss the 1 s debounce window, but cheap
 *  enough to keep idle CPU near zero. */
const FLUSH_INTERVAL_MS = 250;

/**
 * Mounts the global STOMP subscription for the live
 * `telemetryStore` and `alertsStore`. Rendered exactly once in
 * `(app)/layout.tsx`, so the WS stays connected across page
 * navigation as long as the user is authenticated.
 *
 * - Telemetry frames are buffered and flushed to the store at
 *   most once per second (the spec's debounce pattern).
 * - Alert frames are pushed immediately.
 * - Does NOT clear the store on unmount: the next authenticated
 *   session should pick up where this one left off, and other
 *   pages (notably `/mapping`) read the store while the user
 *   is on them.
 */
export function TelemetryStreamMount() {
  const token = useAuthStore((s) => s.token);
  const pushTelemetry = useTelemetryStore((s) => s.pushTelemetry);
  const pushAlert = useTelemetryStore((s) => s.pushAlert);

  useEffect(() => {
    if (!token) return;

    const client = createWsClient(token);
    const buffer: TelemetryEvent[] = [];
    let lastFlush = 0;
    let unsubs: Array<() => void> = [];

    client.onConnect = () => {
      unsubs.push(
        subscribe(client, '/topic/telemetry', (m) => {
          try {
            const evt = JSON.parse(m.body) as TelemetryEvent;
            buffer.push(evt);
          } catch {
            // ignore malformed frame
          }
        }),
      );
      unsubs.push(
        subscribe(client, '/topic/alerts', (m) => {
          try {
            const alert = JSON.parse(m.body) as Alert;
            pushAlert(alert);
          } catch {
            // ignore malformed frame
          }
        }),
      );
    };

    client.onStompError = (frame) => {
      // eslint-disable-next-line no-console
      console.warn('STOMP error', frame.headers['message']);
    };

    client.activate();

    const flushTimer = window.setInterval(() => {
      const now = Date.now();
      if (now - lastFlush < DEBOUNCE_MS) return;
      if (buffer.length === 0) return;
      lastFlush = now;
      const batch = buffer.slice();
      buffer.length = 0;
      pushTelemetry(batch);
    }, FLUSH_INTERVAL_MS);

    return () => {
      window.clearInterval(flushTimer);
      for (const u of unsubs) u();
      unsubs = [];
      client.deactivate();
      // Flush any pending events on unmount so a sign-out does
      // not strand a buffered frame.
      if (buffer.length > 0) {
        pushTelemetry(buffer.slice());
        buffer.length = 0;
      }
    };
  }, [token, pushTelemetry, pushAlert]);

  return null;
}
