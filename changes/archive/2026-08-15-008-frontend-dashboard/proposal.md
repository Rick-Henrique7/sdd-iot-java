# Change 008 — `frontend-dashboard` — Proposal

## Why
The backend is end-to-end live: the IoT simulator (Change 006) is
pushing telemetry at 3 msg/s, the ingestion service is persisting
events, and the alert processor is evaluating thresholds and
broadcasting to a STOMP topic. But there's no human-facing way to
*see* any of that — `/dashboard` is still the "Change 008" placeholder
shipped in Change 007.

This change replaces that placeholder with the real
"single-pane-of-glass" the spec calls for: three KPI cards, a live
telemetry chart, an alert feed, and the detailed fleet table. It is
the first page a user lands on after login.

## What
* **Three KPI cards** at the top of the dashboard:
  * Frota ativa (how many of the seeded machines have been seen
    in the last 60 s).
  * Temperatura média do motor (rolling 5 min average).
  * Alertas críticos nas últimas 24 h.
* **Main panel** — line chart of engine temperature × RPM, with
  60 s of sliding history. Updates from a STOMP topic.
* **Alert panel** on the right — scrollable list of the most
  recent critical / warning alerts, with severity colour and
  timestamp. Live updates.
* **Fleet table** at the bottom — list of every known equipment
  with the latest metrics, sortable, refreshes every 5 s.

The data comes from two sources:
* **HTTP polling** for the KPIs and the fleet table (every 5–10 s)
  through `api-gateway`.
* **WebSocket STOMP** (`/topic/telemetry` + `/topic/alerts`) for
  the chart and the alert panel. Updates are **debounced at 1 s**
  before the React state changes — exactly the pattern the
  `struct-frontend.md` spec calls for.

## Non-goals
- **No filters** (date range, severity, equipment) — those are out
  of scope and ship in a future iteration.
- **No alert acknowledgement** — we render alerts but don't allow
  marking them as handled. That's a Settings/Operations feature
  (Change 010 or later).
- **No PDF/CSV export.**
- **No map** — that's Change 009.
- **No Leaflet, no Recharts** — we keep the chart minimal and
  dependency-free (small SVG, hand-rolled). If we ever need a
  real chart library we can swap it in later; the data shape is
  stable.

## Affected layers
- **Frontend** only — `frontend-shell/` gains a new module
  `src/modules/dashboard/` and replaces the placeholder at
  `src/app/(app)/dashboard/page.tsx`.
- **No backend change.** The STOMP topic
  (`/topic/alerts`) and the new `/topic/telemetry` (emitted by
  `telemetry-ingestion-service` from the persisted event) are
  already present, or made available with a one-line config tweak
  in this same change.
- **No new container** — the dashboard reuses the running
  `frontend-shell`.

## Out of scope (Changes 009 + 010)
- **Change 009** — `/mapping` (Leaflet, heatmap, Open-Meteo
  widget) and `/fleet` (CRUD against `fleet-mapping-service`).
- **Change 010** — `/settings` (alert thresholds, profile, etc).
