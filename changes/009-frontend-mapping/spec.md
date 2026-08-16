# Change 009 — `frontend-mapping` + `frontend-fleet` — Spec

> **Behavioural contract. The mapping and fleet pages, end to end.**

---

## 1. Page: `/mapping`

### F1.1 — Map shell
- Leaflet map (`react-leaflet@4`) wrapped in a small adapter
  that lazy-loads the Leaflet CSS on mount (no FOUC, no global
  side-effect at app boot).
- Initial view: `[-22.0, -47.0]` (the synthetic origin used by
  the backend), zoom `13`.
- OpenStreetMap tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
  with the standard attribution.

### F1.2 — Tractor markers
- One `<Marker>` per equipment from
  `GET /api/v1/fleet` (polled every 30 s — the fleet changes
  rarely so a slower cadence is fine).
- Position: latest `telemetryStore.telemetry[equipmentId][-1].gps`
  if we have any live data; otherwise the field centre.
- Marker icon: a small `lucide-react` Truck glyph drawn into a
  Leaflet `divIcon` so it follows the brand palette
  (`#367C2B` for OPERATIONAL, `#FFDE00` for MAINTENANCE,
  `#94A3B8` for INACTIVE).
- Clicking a marker opens a `<Popup>` with:
  - `equipmentId`, `name`, `type`, `status`
  - latest `engineTemp` (colour-coded), `rpm`, `speed`,
    `fuelLevel`
  - last seen as a `<RelativeTime>`.

### F1.3 — Heatmap layer
- A `<Select>` above the map lets the user pick a `fieldId`
  from a small static list (`FLD-01`, `FLD-02`, `FLD-03`).
  Picking a value fetches
  `GET /api/v1/mapping/heatmaps?fieldId=…` and renders the
  result as a `leaflet.heat` layer with
  `radius=25, blur=18, max=1.0, gradient={0.4:'#367C2B', 0.7:'#FFDE00', 1.0:'#EF4444'}`.
- Toggling the layer off (`<Switch>` next to the select) hides
  it without re-fetching.

### F1.4 — Field plot polygons
- Three static `<Polygon>` definitions hard-coded in
  `src/lib/fieldPlots.ts` (centred on the same origin, each
  ~0.5 km²). They serve as visual context only — there is no
  API for them yet.
- Polygons use a `card-2` fill at 30 % opacity and a
  `brand` stroke at 1 px.

### F1.5 — Open-Meteo widget
- Sits in a panel in the top-right corner of the map.
- Polls `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&current=temperature_2m,wind_speed_10m,precipitation&timezone=auto`
  once on mount, then every 10 minutes.
- Renders: temperature (°C), wind (km/h), precipitation (mm),
  plus a small "Open-Meteo" attribution link.
- If the API call fails (offline, blocked), the widget shows
  a "weather data unavailable" placeholder; the map keeps
  working.

### F1.6 — Layout
```
+----------------------------------------------------------+
|  fieldId [FLD-01 v]   [x] heatmap     Open-Meteo widget   |
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                    LEAFLET MAP                           |
|              (markers + heat + polygons)                  |
|                                                          |
+----------------------------------------------------------+
|  Legend: Operational / Maintenance / Inactive           |
+----------------------------------------------------------+
```

## 2. Page: `/fleet`

### F2.1 — Equipment list
- Table, columns: `ID`, `Name`, `Model`, `Type`, `Status`,
  `Horometer (h)`, `Last Maintenance`, `Actions`.
- Data: `useFleet()` (existing hook from Change 008), polled
  every 10 s. No live tail here — the dashboard owns the live
  story; this page is the management surface.
- Each row has two action buttons:
  - `Editar` — opens the edit modal (status + horometer).
  - `Desativar` / `Reativar` — quick toggle. Disabled while a
    request is in flight.

### F2.2 — Register modal
- Triggered by the page's primary button `+ Cadastrar equipamento`.
- Form fields: `id`, `name`, `model`, `serialNumber`, `type`
  (Select), `status` (Select), `horometerHours` (number),
  `lastMaintenanceDate` (date, optional).
- On submit: `POST /api/v1/fleet`. On `201`, the modal closes
  and the table refreshes. On `4xx`, the modal shows the
  backend's error envelope (`code` + `message`) inline.
- The `id` is mandatory and must be unique. We don't validate
  uniqueness client-side; the backend's `409` flows through.

### F2.3 — Status toggle (re-POST)
- The row action sends a `POST /api/v1/fleet` with the same
  `id` and the new `status`, after a `confirm()` dialog
  explaining the change.
- This works because Change 005's
  `RegisterEquipmentUseCase` uses the caller-supplied `id` as
  the primary key — re-posting with the same `id` is an
  upsert in practice (verified in the integration test).

### F2.4 — Layout
```
+----------------------------------------------------------+
|  Frota  [10 equipamentos]              [+ Cadastrar]      |
+----------------------------------------------------------+
|  ID         | Nome        | Modelo | Tipo   | Status | … |
+----------------------------------------------------------+
|  TRAC-001   | Trator 6110J| 6110J  | TRACTOR| OPE   | … |
|  …                                                       |
+----------------------------------------------------------+
```

## 3. Data sources

| Surface               | Source                                                  | Cadence |
|-----------------------|---------------------------------------------------------|---------|
| Mapping markers       | `GET /api/v1/fleet` + live `telemetryStore` (Change 008)| 30 s / live |
| Heatmap               | `GET /api/v1/mapping/heatmaps?fieldId=…`                | on field change |
| Field plot polygons   | static seed (`src/lib/fieldPlots.ts`)                    | — |
| Open-Meteo            | `https://api.open-meteo.com/v1/forecast`                 | 10 min |
| Fleet list            | `GET /api/v1/fleet`                                      | 10 s   |
| Register / status     | `POST /api/v1/fleet`                                     | on submit |

## 4. Non-functional requirements

1. **Leaflet CSS is scoped** — the leaflet stylesheet is
   imported only by the `MapShell` component, never globally.
2. **No SSR for the map** — `react-leaflet` requires
   `window`. The page is `'use client'` and uses `next/dynamic`
   to defer the map import to client mount.
3. **Open-Meteo is a public API** — the call is fire-and-forget;
   a failure must not block the page render.
4. **Tests** — vitest covers the Open-Meteo adapter (URL
   shape, timeouts), the heatmap query hook, and the
   fieldId-to-fetch mapping. The Leaflet map itself is a
   visual surface; we don't render-test it (would require
   jsdom + canvas polyfills, more cost than value).

## 5. Acceptance criteria

1. `npm test` exits 0 with the new mapping / fleet cases
   added.
2. `npm run build` succeeds. The mapping page is the
   largest route; target `< 200 KB` First Load JS.
3. `docker compose up -d frontend-shell` (with the rest of
   the stack up) renders the mapping page at
   `http://localhost:3000/mapping`:
   - Map tiles load.
   - At least one tractor marker is visible (matching the
     equipment the iot-simulator is emitting for).
   - Heatmap toggle shows / hides the heat layer.
   - Open-Meteo widget shows a temperature (or the
     "unavailable" placeholder).
4. `/fleet` shows the registered equipment; the register
   modal creates a new row; status toggle re-POSTs and
   the table updates.
5. No browser console errors at idle.
