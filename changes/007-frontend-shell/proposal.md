# Change 007 — `frontend-shell` — Proposal

## Why
The Agro-IoT backend is fully shipped (Changes 001–006), but the only
way to interact with it today is `curl` against the `api-gateway`.
The SDD already lists a frontend in
`docs/frontend/blueprint.md` and `docs/frontend/struct-frontend.md` —
this change picks the smallest viable slice of that blueprint and
ships it.

## What
A new `frontend-shell/` directory at the repo root containing a
**Next.js 14** (App Router, TypeScript, Tailwind CSS) application that
ships the platform's *shell*:

1. **Login / Register** screen (split-screen, dark mode, brand palette).
2. **Authenticated shell** with a collapsible sidebar and a top header.
3. **JWT round-trip** through the existing `api-gateway` (Change 001)
   and `auth-service` (Change 002) — no new auth flow on the backend.
4. **Placeholder routes** for the four modules that the spec
   promises: `/dashboard`, `/mapping`, `/fleet`, `/settings`. Each
   renders a "coming in Change 0xx" card so the navigation already
   works end-to-end.
5. **State plumbing** that subsequent changes will use as-is:
   - `Zustand` store for auth + UI state.
   - `React Query` for server cache and retries.
   - `axios` instance with a JWT interceptor.
   - `withAuth` HOC for protected pages.

The full telemetry dashboard, the Leaflet map, the WebSocket stream,
and the fleet CRUD all land in Changes 008–010. This change ships the
**scaffolding + auth + navigation** that those changes will plug into.

## Non-goals
- **No MUI.** The spec mentions MUI but the only UI primitives needed
  for the shell (Button, Input, Select) are 50-line Tailwind
  components. Adding MUI doubles the install weight for a small
  win, and the dark palette in `blueprint.md` is easier to express
  in plain Tailwind.
- **No Leaflet / WebSocket / Open-Meteo** — that is Changes 008–009.
- **No tests against a live API.** Unit tests cover the auth store
  and a few pure helpers; integration with the running backend is
  done in the `docker compose up` smoke test.
- **No PWA, i18n, or RTL** — out of scope for the shell.

## Affected layers
- **New app** `frontend-shell/`.
- **`docker-compose.yml`** — enable the `frontend-shell` block.
- **`.github/workflows/docker-image.yml`** — add `frontend-shell` to
  the matrix (so the GHCR image is published on every push to
  `main`).
- **`.github/workflows/ci.yml`** — run `npm run build` and
  `npm test` for the new app (the Maven `verify` step is
  independent).
- **`init.sql`** — no change.
- **No backend service is touched** — the frontend talks to
  `api-gateway:8080` (or `localhost:8080` outside Docker).

## Out of scope (Changes 008–010)
- **Change 008** — `/dashboard` with KPI cards, the live telemetry
  chart, the alert panel, the WebSocket stream.
- **Change 009** — `/mapping` with React Leaflet, the application
  heatmap, the Open-Meteo widget, plus `/fleet` CRUD.
- **Change 010** — `/settings` (alert thresholds, profiles) and
  any remaining polish.
