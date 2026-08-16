# Change 009 — `frontend-mapping` + `frontend-fleet` — Tasks

## 1. SDD artifacts
- [x] `changes/009-frontend-mapping/{proposal,spec,design,tasks}.md`

## 2. Dependencies
- [x] Add `react-leaflet@^4`, `leaflet@^1.9`, and
      `leaflet.heat@^0.2` to `frontend-shell/package.json`
      (and the matching `@types/leaflet`).

## 3. Lib / shared pieces
- [x] `src/lib/leaflet.ts` — central place to import the
      Leaflet CSS and re-export `react-leaflet` primitives.
- [x] `src/lib/fieldPlots.ts` — 3 static `FieldPlot` records.
- [x] `src/lib/weatherApi.ts` — `fetchCurrentWeather` with
      abort-signal support and a typed `CurrentWeather`.
- [x] `src/components/ui/Switch.tsx` — small toggle.
- [x] `src/components/ui/Modal.tsx` — focus-trapped dialog.

## 4. Hooks
- [x] `src/hooks/useHeatmap.ts` — React Query for
      `/api/v1/mapping/heatmaps`.

## 5. `/mapping` page
- [x] `src/modules/mapping/Mapping.tsx` — composes the layers
      and the Open-Meteo widget.
- [x] `src/modules/mapping/MapShell.tsx` — `MapContainer` +
      `TileLayer`, dynamic-imported with `ssr: false`.
- [x] `src/modules/mapping/TractorMarker.tsx` — branded
      `divIcon` + `<Popup>`.
- [x] `src/modules/mapping/HeatmapLayer.tsx` — wraps
      `leaflet.heat`.
- [x] `src/modules/mapping/FieldPlotLayer.tsx` — `<Polygon>`
      from the static seed.
- [x] `src/modules/mapping/OpenMeteoWidget.tsx` — panel with
      the three metrics.
- [x] `src/modules/mapping/FieldPicker.tsx` — `<Select>` for
      the three fieldIds.
- [x] `src/app/(app)/mapping/page.tsx` — replace placeholder.

## 6. `/fleet` page
- [x] `src/modules/fleet/Fleet.tsx` — composes the table and
      the register modal.
- [x] `src/modules/fleet/FleetTable.tsx` — same columns as
      the dashboard fleet table, no live tail.
- [x] `src/modules/fleet/RegisterModal.tsx` — full DTO form
      with inline error rendering.
- [x] `src/modules/fleet/useRegisterEquipment.ts` — mutation
      hook with `invalidateQueries(['fleet'])`.
- [x] `src/app/(app)/fleet/page.tsx` — replace placeholder.

## 7. Tests
- [x] `src/lib/weatherApi.test.ts` — URL, mapping, errors,
      abort.
- [x] `src/hooks/useHeatmap.test.tsx` — enable / disable
      behaviour + result mapping.
- [x] `src/modules/fleet/RegisterModal.test.tsx` — submit
      shape + success / error paths.
- [x] `npm test` → 0 failures.

## 8. Local validation
- [x] `npm run build` → 0 errors. Mapping route ≤ 200 KB
      First Load JS.
- [x] `docker compose up -d frontend-shell` (with the rest of
      the stack up) renders `/mapping` and `/fleet`.
- [x] Mapping: at least one marker visible, heatmap toggle
      works, Open-Meteo widget renders or shows the
      "unavailable" placeholder.
- [x] Fleet: register a new equipment via the modal; verify
      it shows up in the table; status toggle updates the
      row.
- [x] 0 browser console errors at idle.

## 9. Git
- [x] Single commit:
      `feat(fe): ship Change 009 - frontend-mapping + frontend-fleet`.
- [x] Push to `origin/009-frontend-mapping`.
- [x] Open PR, wait for CI green, squash-merge into `main`.
- [x] Archive Change 009 in
      `changes/archive/2026-08-15-009-frontend-mapping/`.
