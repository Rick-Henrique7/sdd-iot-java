# Change 008 — `frontend-dashboard` — Tasks

## 1. SDD artifacts
- [x] `changes/008-frontend-dashboard/{proposal,spec,design,tasks}.md`

## 2. Backend touch (one line, no behaviour change)
- [x] `alert-processing-service`: in `ProcessedTelemetryConsumer`,
      after parsing the `TelemetryMessage` envelope, call
      `messagingTemplate.convertAndSend("/topic/telemetry", envelope)`
      so the same broker that publishes `/topic/alerts` also
      publishes the live telemetry stream. (The ingestion service
      doesn't run a broker; routing it through the alert service
      keeps a single `/ws` endpoint and reuses the existing
      `SimpMessagingTemplate`.)
- [x] `alert-processing-service`: in `WebSocketConfig`, drop
      `withSockJS()` so the front-end can connect with a plain
      `new WebSocket(WS_URL)` instead of bundling a SockJS client.

## 3. Frontend source
- [x] `src/lib/ws.ts` — `createWsClient` + `subscribe` (STOMP)
- [x] `src/stores/telemetryStore.ts` — Zustand with `push` / `clear`
- [x] `src/hoc/withTelemetryStream.tsx` — debounce HOC (1 s)
- [x] `src/hooks/useFleet.ts`, `useRecentAlerts.ts`, `useKpis.ts`
- [x] `src/types/{telemetry,alert,equipment}.ts`
- [x] `src/components/dashboard/{SeverityDot,RelativeTime,EquipmentPicker}.tsx`
- [x] `src/modules/dashboard/{Dashboard,KpiRow,KpiCard,TelemetryChart,AlertPanel,AlertRow,FleetTable}.tsx`
- [x] `src/app/(app)/dashboard/page.tsx` — replace placeholder with `<Dashboard />`

## 4. Tests
- [x] `src/stores/telemetryStore.test.ts` — push / clear
- [x] `src/hoc/withTelemetryStream.test.tsx` — debounce timing
- [x] `npm test` → 0 failures

## 5. Container / CI
- [x] No Dockerfile change.
- [x] No `docker-image.yml` change.
- [x] CI: `npm ci && npm test && npm run build` already runs on
      every push (Change 007).

## 6. Local validation
- [x] `npm run build` → dashboard route, all chunks ≤ 50 KB.
- [x] `docker compose up -d frontend-shell` (full stack).
- [x] Open `http://localhost:3000/dashboard` and see:
      * 3 KPI cards populated within 5 s.
      * Telemetry chart with at least 5 data points in 10 s.
      * Alert panel with at least 1 row in 30 s.
      * Fleet table with 3 rows.

## 7. Git
- [x] Single commit: `feat(fe): ship Change 008 - frontend-dashboard`.
- [x] Push to `origin/main`.
- [x] CI green.
