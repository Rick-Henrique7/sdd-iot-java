# Change 009 — `frontend-mapping` + `frontend-fleet` — Design

> **Technical decisions, trade-offs, and how the spec is realized in code.**

---

## 1. Module layout

```
frontend-shell/src/
├── modules/
│   ├── mapping/                       # NEW
│   │   ├── Mapping.tsx                # page composition
│   │   ├── MapShell.tsx               # Leaflet wrapper (dynamic import)
│   │   ├── TractorMarker.tsx          # branded divIcon + popup
│   │   ├── HeatmapLayer.tsx           # leaflet.heat layer
│   │   ├── FieldPlotLayer.tsx         # static polygon seed
│   │   ├── OpenMeteoWidget.tsx        # current weather
│   │   ├── FieldPicker.tsx            # fieldId select
│   │   └── useDebouncedMappingData.ts # small helper (unused for now)
│   └── fleet/                         # NEW
│       ├── Fleet.tsx                  # page composition
│       ├── FleetTable.tsx             # mirrors dashboard, no live tail
│       ├── RegisterModal.tsx          # EquipmentDTO form
│       └── useRegisterEquipment.ts    # POST + invalidate query
├── lib/
│   ├── leaflet.ts                     # NEW: CSS import, MapContainer default props
│   ├── fieldPlots.ts                  # NEW: 3 static polygons
│   ├── weatherApi.ts                  # NEW: Open-Meteo client
│   └── api.ts                         # existing (axios + JWT)
├── hooks/
│   └── useHeatmap.ts                  # NEW: React Query for /mapping/heatmaps
├── components/ui/
│   ├── Switch.tsx                     # NEW: simple toggle (used by heatmap layer)
│   └── Modal.tsx                      # NEW: simple modal (used by register form)
└── app/
    ├── (app)/mapping/page.tsx         # replace placeholder with <Mapping />
    └── (app)/fleet/page.tsx           # replace placeholder with <Fleet />
```

## 2. The Leaflet CSS problem

`leaflet/dist/leaflet.css` is a global stylesheet. If imported
at the app root, the selectors bleed into every page (e.g. the
`.panel` class on the dashboard would compete with Leaflet's
`.panel` if such a class existed). The convention here:

- The CSS is imported **only** by `MapShell.tsx`. Next.js
  hoists the import to the layout chunk only on routes that
  reach the map, so non-mapping pages don't pay for it.
- `MapShell` is loaded via `next/dynamic({ ssr: false })` so the
  bundle is split out and Leaflet's `window` dependency doesn't
  trip SSR.

## 3. Tractor markers as divIcons

`<Marker icon={...}>` accepts a Leaflet `Icon` or a `divIcon`.
A `divIcon` lets us ship a small inline `<svg>` that follows
the brand palette and is recoloured per status — no extra
asset files.

```tsx
const icon = (status: EquipmentStatus) =>
  L.divIcon({
    className: 'agrio-tractor-marker',
    html: `<svg viewBox="0 0 24 24" width="20" height="20"
             style="color:${STATUS_COLOR[status]}" ...>
            <path d="..." />
          </svg>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
```

The map is re-rendered only when the fleet list or the live
telemetry actually changes — see the memoisation in
`MapShell` below.

## 4. `MapShell` props and memoisation

```tsx
interface MapShellProps {
  center: [number, number];
  zoom: number;
  equipment: { id: string; status: EquipmentStatus; latestGps?: [number, number] }[];
  fieldPlot: FieldPlot | null;
  heat: { lat: number; lng: number; intensity: number }[] | null;
  onMarkerClick: (id: string) => void;
}

function MapShellImpl({ center, zoom, equipment, fieldPlot, heat, onMarkerClick }: MapShellProps) {
  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 attribution="&copy; OpenStreetMap" />
      {fieldPlot && <FieldPlotLayer plot={fieldPlot} />}
      {heat && <HeatmapLayer points={heat} />}
      {equipment.map((e) => (
        <Marker key={e.id}
                position={e.latestGps ?? center}
                icon={iconFor(e.status)}
                eventHandlers={{ click: () => onMarkerClick(e.id) }}>
          <Popup><TractorPopup id={e.id} /></Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
export const MapShell = React.memo(MapShellImpl);
```

The component is `React.memo`'d and consumes only the props it
needs. The parent (`Mapping`) keeps the equipment list in a
`useMemo` derived from `useFleet()` + the live `telemetryStore`.

## 5. Open-Meteo adapter

`src/lib/weatherApi.ts`:

```ts
export interface CurrentWeather {
  temperatureC: number;
  windKmh: number;
  precipitationMm: number;
  observedAt: string; // ISO
}

export async function fetchCurrentWeather(
  lat: number, lng: number, signal?: AbortSignal,
): Promise<CurrentWeather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('current', 'temperature_2m,wind_speed_10m,precipitation');
  url.searchParams.set('timezone', 'auto');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const json = await res.json() as {
    current: { temperature_2m: number; wind_speed_10m: number; precipitation: number; time: string };
  };
  return {
    temperatureC: json.current.temperature_2m,
    windKmh: json.current.wind_speed_10m,
    precipitationMm: json.current.precipitation,
    observedAt: json.current.time,
  };
}
```

The component re-fetches every 10 minutes with a `setInterval`
that passes a fresh `AbortController.signal` to cancel the
in-flight request on unmount.

## 6. Heatmap query

`src/hooks/useHeatmap.ts`:

```ts
export function useHeatmap(fieldId: string | null) {
  return useQuery({
    queryKey: ['heatmap', fieldId],
    queryFn: async ({ signal }) => {
      if (!fieldId) return [];
      const { data } = await api.get<HeatmapPoint[]>(
        '/api/v1/mapping/heatmaps', { params: { fieldId }, signal },
      );
      return data;
    },
    enabled: Boolean(fieldId),
    staleTime: 60_000,
  });
}
```

The heat layer only renders when the query has data and the
`<Switch>` is on; flipping the switch off doesn't refetch.

## 7. Fleet CRUD

### `useRegisterEquipment`
```ts
export function useRegisterEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Equipment) => api.post<Equipment>('/api/v1/fleet', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fleet'] }),
  });
}
```

### Status toggle
`onToggleStatus(id, newStatus)` calls `useRegisterEquipment`
with the existing equipment's fields, swapping `status`. The
backend's `RegisterEquipmentUseCase` is a thin upsert (the
test `shouldRegisterEquipment` covers this), so re-posting
with the same `id` updates the row. We refresh the fleet
list on success.

### `Switch.tsx` and `Modal.tsx`
Tiny presentational primitives — `<Switch>` is a labelled
checkbox styled with the brand palette; `<Modal>` is a
focus-trapped dialog with a backdrop. We don't reach for
`@headlessui/react` because the spec already draws the line
at Tailwind primitives.

## 8. State & data flow

```
                       +---------------------------+
                       | useFleet() (10s polling)  |
                       +-------------+-------------+
                                     |
                       +-------------v-------------+
                       | useEquipmentTelemetry()   |  <- reads telemetryStore
                       |  enriches fleet w/ latest |
                       |  GPS                      |
                       +-------------+-------------+
                                     |
              +----------------------+----------------------+
              |                                             |
   +----------v----------+                       +----------v----------+
   | <Mapping />         |                       | <Fleet />           |
   |   MapShell          |                       |   FleetTable        |
   |     markers         |                       |     rows            |
   |     heat layer      |                       |   RegisterModal     |
   |     field polygons  |                       |     POST /fleet      |
   |   OpenMeteoWidget   |                       +---------------------+
   +---------------------+
```

## 9. Tests

1. `src/lib/weatherApi.test.ts` — URL is well-formed, the
   response is mapped, errors propagate, the abort signal
   cancels.
2. `src/hooks/useHeatmap.test.tsx` — only fires when
   `fieldId` is set, maps the array, surfaces errors.
3. `src/modules/fleet/RegisterModal.test.tsx` — submit POSTs
   the right DTO; the success path closes the modal and the
   error path renders the message.

## 10. What is **not** changed

- `fleet-mapping-service` — no backend change. The status
  toggle re-uses the existing `POST /api/v1/fleet` upsert
  semantics; the integration test in Change 005 already
  proves this works.
- `init.sql` — no schema change.
- Docker / CI — no new image, no new workflow.
