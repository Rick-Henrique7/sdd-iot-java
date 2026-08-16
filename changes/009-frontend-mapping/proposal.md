# Change 009 — `frontend-mapping` + `frontend-fleet` — Proposal

## Why
The backend is end-to-end live: the IoT simulator pushes telemetry
at 3 msg/s, the fleet is registered, the heatmap endpoint returns
deterministic synthetic points per `fieldId`, and the dashboard
(Change 008) already consumes both REST and the STOMP stream.

But the operator still has no **geographic view** (where are the
machines, what's the field look like, is it about to rain?) and
no way to **manage the fleet** (register a new tractor, mark one
out of service, retire a sprayer). This change fills both gaps:

- `/mapping` is the **single-pane of geographic context** for the
  operator: a Leaflet map with tractor positions, the field
  plots, a heatmap of "application intensity" (the synthetic MVP
  from the backend, but rendered properly), and an Open-Meteo
  widget with current weather.
- `/fleet` is the **CRUD surface** for the equipment registry.
  List, register, edit (status + horometer), and the same
  detail-from-list transitions used in the dashboard table.

Both pages consume what the backend already exposes
(`fleet-mapping-service` Change 005) — no new backend contract
is needed in this change.

## What

### `/mapping` page
- **Leaflet map** (`react-leaflet@4`) with OpenStreetMap tiles.
- **Tractor markers** — one per equipment from
  `GET /api/v1/fleet`. The marker is positioned at the latest
  GPS reading we have in the live telemetry store
  (Change 008's `telemetryStore`), falling back to the field
  centre when no telemetry has arrived yet.
- **Heatmap layer** (`leaflet.heat`) — for the selected
  `fieldId` (a small `<Select>` above the map), renders
  `GET /api/v1/mapping/heatmaps?fieldId=…` as a translucent
  heat layer.
- **Field plot polygons** — rendered as
  `<Polygon>` from a small static seed list (no GET for plots
  in this change; the backend has the entity but the MVP only
  exposes heatmaps).
- **Open-Meteo widget** — current temperature, wind, and
  precipitation at the map centre, polled every 10 minutes via
  the public Open-Meteo API (no key, `forecast?latitude=…&longitude=…&current=temperature_2m,wind_speed_10m,precipitation`).
- **Equipment detail popover** — clicking a marker opens a
  small popover with the same data the dashboard's fleet
  table shows (status, RPM, temp, last seen).

### `/fleet` page
- **Equipment list** — table mirroring the dashboard's fleet
  table but **without** the live tail; the same data the
  mapping page consumes.
- **Register form** — modal with the full `EquipmentDTO` fields
  (id, name, model, serialNumber, type, status,
  horometerHours, lastMaintenanceDate). POSTs to
  `/api/v1/fleet` and refreshes the list.
- **Status toggle** — quick "mark as INACTIVE / MAINTENANCE /
  OPERATIONAL" buttons on each row. PATCH is out of scope for
  this change; the row uses a confirm-then-POST-as-new-equipment
  pattern via a small `updateEquipmentStatus` use case on the
  client that re-POSTs with the same id (idempotent only if the
  backend treats `id` as the upsert key, which it does in
  Change 005). This keeps the change single-PR while still
  giving the operator the most common workflow.
- **No PATCH / DELETE** — explicitly out of scope (see below).

## Non-goals

- **No real telemetry → heatmap** pipeline. The heatmap remains
  the deterministic MVP from Change 005. A future change will
  aggregate real `agri.telemetry.processed` into the heatmap.
- **No field-plot CRUD** — polygons are read-only here. The
  `FieldPlot` entity exists in the backend but the public
  endpoint isn't there yet. The mapping page renders a small
  static seed list as a placeholder.
- **No DELETE on equipment** — registration + status updates
  cover the operator's day-to-day; delete is a destructive
  operation that needs a soft-delete pattern (out of scope).
- **No map clustering** beyond what `leaflet.heat` provides —
  with ≤ 50 equipment the heatmap reads cleanly without
  needing marker clustering.
- **No PATCH endpoint on the backend** — the fleet controller
  has GET + POST. A future change adds PATCH; for now the
  client does a re-POST with the same id.

## Affected layers

- **Frontend only** — `frontend-shell/` gains
  `src/modules/mapping/` and `src/modules/fleet/`, plus a small
  `react-leaflet` + `leaflet.heat` adapter (`src/lib/leaflet.ts`)
  to keep Leaflet's CSS import isolated.
- **No backend change.**
- **No new container / no new env var.**

## Out of scope (future changes)

- **Change 010** — `/settings` (alert thresholds, profile,
  password change).
- **Heatmap from real telemetry** — Kafka aggregation pipeline
  that buckets `agri.telemetry.processed` per `fieldId` and
  writes a `field_heatmap` table.
- **Field-plot CRUD** — UI + backend PATCH for `FieldPlot`.
- **Marker clustering** — needed once the fleet grows past
  ~100 units.
