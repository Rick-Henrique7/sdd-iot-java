# Change 008 — `frontend-dashboard` — Spec

## Functional requirements

### F1. Three KPI cards (top row)

* **Frota Ativa** — number of equipment IDs that have emitted
  telemetry in the last 60 s, divided by the total known
  equipment. Format: `N / M` (e.g. `3 / 3`).
* **Temperatura Média do Motor** — average `engineTemp` over the
  last 5 min, in °C, with one decimal. State: green when in
  `[70, 95)`, yellow when in `[95, 100)`, red when `≥ 100`.
* **Alertas Críticos (24 h)** — count of `severity = CRITICAL`
  alerts in the last 24 h. Red badge if `> 0`.

Each card has a label, the KPI value (28 px, monospaced, bold),
and a short hint line ("últimos 60 s" etc).

### F2. Live telemetry chart (main panel)

* A line chart of `engineTemp` (left Y axis, °C) and `rpm`
  (right Y axis, integer), both over the last 60 s.
* The chart is **time-bucketed to 1 s** — multiple events in the
  same second are averaged.
* It shows the **selected equipment** (default: the first one
  seen in the last 60 s). A small selector above the chart lets
  the user pick a different equipment.
* The chart auto-scrolls left as time passes.
* Implementation: small SVG, hand-rolled. No chart library
  dependency.

### F3. Alert panel (right column)

* A scrollable list of the 50 most recent alerts, newest first.
* Each row: `[severity-icon] [equipment] [rule] [time]`.
* CRITICAL = red dot, WARNING = yellow dot, INFO = blue dot.
* Hovering highlights the row.
* Clicking a row opens a small modal with the full alert body
  (equipmentId, rule, severity, createdAt, value snapshot).
* The list updates live from the STOMP topic.

### F4. Fleet table (bottom)

* Columns: `ID` (sortable), `Status` (OPERATIONAL/MAINTENANCE/
  INACTIVE), `RPM` (latest), `Temp (°C)` (latest, colour-coded),
  `Speed` (latest), `Fuel (%)` (latest), `Last seen` (relative
  time).
* Refreshes every 5 s via React Query.
* The status dot follows the same colour rule as the brand
  palette (green/yellow/red).

## Data sources

| Surface          | Source                                                         | Cadence |
|------------------|----------------------------------------------------------------|---------|
| KPI cards        | `GET /api/v1/telemetry/events?since=…` + `GET /api/v1/alerts`   | 5 s     |
| Telemetry chart  | STOMP `/topic/telemetry` (live, debounced 1 s)                  | live    |
| Alert panel      | STOMP `/topic/alerts` (live)                                    | live    |
| Fleet table      | `GET /api/v1/fleet` + `GET /api/v1/telemetry/events?since=…`    | 5 s     |

`/topic/telemetry` is new in this change — emitted by the
`alert-processing-service` from its `ProcessedTelemetryConsumer`
as it parses each `TelemetryMessage` (it already has the
`SimpMessagingTemplate` and the broker, so it's a single
one-line call). Without it the chart would have to poll, which
contradicts the spec's "WS with debounce" pattern.

## Non-functional requirements

1. **Debounce** — the WebSocket handler buffers events in
   memory and flushes the React state at most once per second
   (the spec's pattern).
2. **No chart library** — the chart is a single `<svg>` with
   two `<polyline>`s and a Y axis. Easy to test, easy to read.
3. **Colours only from the brand palette** — green / yellow /
   red / brand-green per the rules in `blueprint.md`.
4. **No emojis** — `lucide-react` for all icons.
5. **Tests** — vitest covers the debounce HOC and the Zustand
   telemetry store (push, flush, clear).

## Acceptance criteria

1. `npm test` exits 0 with the new debounce / store cases.
2. `npm run build` succeeds and the dashboard chunk is
   ≤ 50 KB First Load JS (no chart lib).
3. `docker compose up -d frontend-shell` (with the rest of
   the stack up) renders the dashboard at
   `http://localhost:3000/dashboard`. Within 10 s of opening:
   * At least one equipment appears in the Fleet table.
   * The Telemetry chart has at least 5 data points.
   * The Alert panel has at least one row (the iot-simulator
     fires anomalies ~every 7 s).
4. The debounce HOC caps the number of `setState` calls at
   ≤ 1 per second even when the WS pushes 30 events/s.
