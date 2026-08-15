# Change 008 — `frontend-dashboard` — Design

## Component layout

```
frontend-shell/src/
├── modules/dashboard/                         # NEW
│   ├── Dashboard.tsx                          # composes the four parts
│   ├── KpiRow.tsx                             # 3 KPI cards
│   ├── KpiCard.tsx                            # one card
│   ├── TelemetryChart.tsx                     # SVG line chart
│   ├── AlertPanel.tsx
│   ├── AlertRow.tsx
│   ├── FleetTable.tsx
│   └── useDebouncedTelemetry.ts               # WS subscription hook
├── components/dashboard/                       # NEW (shared pieces)
│   ├── SeverityDot.tsx
│   ├── RelativeTime.tsx
│   └── EquipmentPicker.tsx
├── stores/
│   ├── authStore.ts                           # existing
│   └── telemetryStore.ts                      # NEW (Zustand)
├── hoc/
│   └── withTelemetryStream.tsx                # NEW (debounce HOC)
├── hooks/
│   ├── useLogout.ts                           # existing
│   ├── useFleet.ts                            # NEW
│   ├── useRecentAlerts.ts                     # NEW
│   └── useKpis.ts                             # NEW
├── lib/
│   ├── api.ts                                 # existing
│   ├── queryClient.ts                         # existing
│   ├── routes.ts                              # existing
│   └── ws.ts                                  # NEW (STOMP client)
└── types/
    ├── auth.ts                                # existing
    ├── api.ts                                 # existing
    ├── telemetry.ts                           # NEW
    ├── alert.ts                               # NEW
    └── equipment.ts                           # NEW
```

The dashboard page itself:

```tsx
// src/app/(app)/dashboard/page.tsx
import { Dashboard } from '@/modules/dashboard/Dashboard';
export default function DashboardPage() {
  return <Dashboard />;
}
```

## State & data flow

```
                  ┌────────────────────┐
                  │  STOMP (live)      │
                  │  /topic/telemetry  │──┐
                  │  /topic/alerts     │  │
                  └────────────────────┘  │
                                            ▼
                       ┌──────── withTelemetryStream (HOC) ────────┐
                       │  in-memory buffer + 1s flush via Zustand   │
                       │  telemetryStore.telemetry[equipmentId]      │
                       │  telemetryStore.alerts                      │
                       └────────┬─────────────┬─────────────┬────────┘
                                ▼             ▼             ▼
                            Chart        AlertPanel    (KPI count
                                                          of alerts)
                                                    
                  ┌────────────────────┐
                  │  React Query (5s)  │────► useFleet  ──► FleetTable
                  │  /api/v1/fleet     │
                  │  /api/v1/telemetry │────► useKpis   ──► KpiRow
                  │  /api/v1/alerts    │────► useRecentAlerts
                  └────────────────────┘
```

* The **HOC** (`withTelemetryStream`) is a thin wrapper that
  opens a STOMP connection on mount, subscribes to
  `/topic/telemetry` and `/topic/alerts`, pushes events into a
  debounce buffer, and closes the connection on unmount.
* The **Zustand store** is updated by the HOC every 1 s
  (debounced). It exposes a `flush()` that React reads via
  `useSyncExternalStore` for tearing-free updates.
* The **HTTP fetches** are independent — they power the
  history (chart) and the "fleet" table that the WS doesn't
  carry.

## WebSocket client (`lib/ws.ts`)

Uses `@stomp/stompjs` v7 with the browser's native `WebSocket`.
The `WebSocketConfig` in `alert-processing-service` exposes the
broker at `ws://<host>:8082/ws` as a **plain** WebSocket endpoint
(no SockJS) so the client doesn't need to bundle a SockJS library:

```ts
import { Client, type IMessage } from '@stomp/stompjs';

const WS_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? 'ws://localhost:8082/ws';

export function createWsClient(_token: string | null): Client {
  return new Client({
    brokerURL: WS_URL,
    reconnectDelay: 2_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    webSocketFactory: () => new WebSocket(WS_URL),
  });
}

export function subscribe(
  client: Client,
  topic: string,
  cb: (msg: IMessage) => void,
): () => void {
  return client.subscribe(topic, cb).unsubscribe;
}
```

The api-gateway routes REST traffic but the reactive gateway does
**not** proxy WebSockets; the browser therefore opens the STOMP
connection directly against `alert-processing-service` (port 8082,
exposed by docker-compose). For
`/topic/telemetry` we re-use the **same** broker: when
`ProcessedTelemetryConsumer` deserialises a `TelemetryMessage` it
also calls `messagingTemplate.convertAndSend("/topic/telemetry", envelope)`
before handing off to the use case. One line, no new bean, no new
dependency. (The design originally proposed wiring it in
`telemetry-ingestion-service`, but that service doesn't run a STOMP
broker, so doing it in `alert-processing-service` is strictly
simpler — single broker, single `/ws` route, single `SimpMessagingTemplate`.)

## The HOC (`hoc/withTelemetryStream.tsx`)

```ts
export function withTelemetryStream<P>(
  Wrapped: ComponentType<P>,
): ComponentType<P> {
  return function WrappedWithStream(props: P) {
    const token = useAuthStore((s) => s.token);
    const flush = useTelemetryStore((s) => s.flush);
    const push = useTelemetryStore((s) => s.push);
    const bufferRef = useRef<TelemetryEvent[]>([]);
    const alertsBufferRef = useRef<Alert[]>([]);
    const lastFlushRef = useRef(0);

    useEffect(() => {
      if (!token) return;
      const client = createWsClient(token);
      client.onConnect = () => {
        subscribe(client, '/topic/telemetry', (m) => {
          bufferRef.current.push(JSON.parse(m.body));
        });
        subscribe(client, '/topic/alerts', (m) => {
          alertsBufferRef.current.push(JSON.parse(m.body));
        });
      };
      client.activate();
      const t = setInterval(() => {
        const now = Date.now();
        if (now - lastFlushRef.current < 1000) return;
        lastFlushRef.current = now;
        if (bufferRef.current.length) {
          push(bufferRef.current.splice(0));
        }
        // alerts are pushed immediately (no debounce — they're
        // already low-rate and we want instant feedback)
      }, 250);
      return () => { clearInterval(t); client.deactivate(); };
    }, [token]);
    return <Wrapped {...props} />;
  };
}
```

Tests:
* The HOC debounces: push 30 events in 100 ms, the store's
  `flush()` is called at most once.

## The chart (TelemetryChart.tsx)

Hand-rolled SVG, no deps:

* `viewBox="0 0 600 240"`.
* Two `<polyline>`s: temperature in red, RPM in brand green.
* X axis: 60 ticks, 1 s each, labels every 10 s.
* Y axis: temperature `[0, 120]`, RPM `[0, 4000]`.
* `useSyncExternalStore(telemetryStore.subscribe, telemetryStore.getSnapshot)`
  to read live data without tearing.

The chart is wrapped in `React.memo` so unrelated store updates
don't re-render it.

## Tests

1. `src/stores/telemetryStore.test.ts`
   * `push(events)` replaces the per-equipment buffer.
   * `clear()` empties everything.
2. `src/hoc/withTelemetryStream.test.tsx`
   * The HOC's debounce timer is honoured: 30 events pushed
     within 100 ms result in exactly one store `flush` call
     in 1 s.

## What is **not** changed
- `init.sql` — no schema change.
- The only backend-side change is a one-line
  `SimpMessagingTemplate.convertAndSend("/topic/telemetry", …)`
  in `alert-processing-service`'s `ProcessedTelemetryConsumer`
  plus a one-line change in `WebSocketConfig` to drop
  `withSockJS()` so the front-end can connect with a plain
  WebSocket. Both are no-ops for existing REST clients.
- Docker / CI — no new image, no new workflow.
