'use client';

import { useEffect, useRef, type ComponentType } from 'react';
import { createWsClient, subscribe } from '@/lib/ws';
import { useAuthStore } from '@/stores/authStore';
import { useTelemetryStore } from '@/stores/telemetryStore';
import type { Alert } from '@/types/alert';
import type { TelemetryEvent } from '@/types/telemetry';

const DEBOUNCE_MS = 1_000;
/** How often the flush interval runs. 250 ms is fine-grained
 *  enough to never miss the 1s debounce window, but cheap
 *  enough to keep idle CPU near zero. */
const FLUSH_INTERVAL_MS = 250;

/**
 * Higher-order component that wraps a dashboard page with a
 * STOMP subscription to `/topic/telemetry` and `/topic/alerts`.
 *
 * - Telemetry frames are buffered in a `useRef` and flushed to
 *   the Zustand store at most once per second (the spec's
 *   debounce pattern). The store update is the only "set state"
 *   on the React side, so we can absorb 30 events/s without
 *   re-rendering 30 times/s.
 * - Alert frames are pushed immediately (no debounce) — they
 *   arrive at most a few times per minute and the user expects
 *   the panel to react instantly.
 *
 * The HOC is intentionally tiny: it does not render any UI of
 * its own, and it does not block the wrapped component.
 */
export function withTelemetryStream<P extends object>(
  Wrapped: ComponentType<P>,
): ComponentType<P> {
  function WrappedWithStream(props: P) {
    const token = useAuthStore((s) => s.token);
    const pushTelemetry = useTelemetryStore((s) => s.pushTelemetry);
    const pushAlert = useTelemetryStore((s) => s.pushAlert);
    const clear = useTelemetryStore((s) => s.clear);

    const bufferRef = useRef<TelemetryEvent[]>([]);
    const lastFlushRef = useRef<number>(0);

    useEffect(() => {
      // We need a token to open the WS. The auth store is
      // hydrated by the AppLayout, so by the time the dashboard
      // mounts the token is present. If it's not (deep link
      // race), we just retry on the next effect cycle.
      if (!token) return;

      const client = createWsClient(token);
      let unsubs: Array<() => void> = [];

      // Capture the buffer ref in a local so the cleanup
      // function below can flush it even though React flags
      // `bufferRef.current` access as a stale-ref risk in
      // strict mode. The buffer is a plain array, not a DOM
      // node, so the lint heuristic is overly conservative
      // here.
      const buffer = bufferRef.current;
      const lastFlush = lastFlushRef;

      client.onConnect = () => {
        unsubs.push(
          subscribe(client, '/topic/telemetry', (m) => {
            try {
              const evt = JSON.parse(m.body) as TelemetryEvent;
              buffer.push(evt);
            } catch {
              // ignore malformed frame; the broker keeps sending
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
        // STOMP ERROR frame — broker rejected us. Log to the
        // console so the developer notices; do not crash.
        // eslint-disable-next-line no-console
        console.warn('STOMP error', frame.headers['message']);
      };

      client.activate();

      // Debounced flush. The 250 ms interval gives us a 4x
      // safety margin over the 1 s debounce window.
      const flushTimer = window.setInterval(() => {
        const now = Date.now();
        if (now - lastFlush.current < DEBOUNCE_MS) return;
        if (buffer.length === 0) return;
        lastFlush.current = now;
        const batch = buffer.slice();
        buffer.length = 0;
        pushTelemetry(batch);
      }, FLUSH_INTERVAL_MS);

      return () => {
        window.clearInterval(flushTimer);
        for (const u of unsubs) u();
        unsubs = [];
        client.deactivate();
        // Flush any pending events on unmount so the user
        // doesn't see them "stuck" if they navigate away
        // mid-bucket. If the store was never written, the
        // pushTelemetry is a no-op.
        if (buffer.length > 0) {
          pushTelemetry(buffer.slice());
          buffer.length = 0;
        }
        // Optional: clear the live store on unmount. The
        // dashboard is the only consumer, so leaving stale
        // events in the store would just be confusing on the
        // next mount.
        clear();
      };
    }, [token, pushTelemetry, pushAlert, clear]);

    return <Wrapped {...props} />;
  }

  WrappedWithStream.displayName = `withTelemetryStream(${
    Wrapped.displayName ?? Wrapped.name ?? 'Component'
  })`;

  return WrappedWithStream;
}
