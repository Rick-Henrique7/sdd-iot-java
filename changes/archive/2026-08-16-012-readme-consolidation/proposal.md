# Change 012 — README consolidation

## Why

The root `README.md` was authored before any SDD change shipped. It
still says "Active change: 001-api-gateway / 002-auth-service" and
its Quickstart only covers `auth-service` + `api-gateway`. Meanwhile
eleven changes have been merged and the platform is end-to-end
live at `http://localhost:3000`. A new operator onboarding on this
repo has no single place to learn:

- Which URLs the platform actually serves today.
- The full set of changes that landed (backend + frontend).
- How to bring the stack up from scratch and which credentials to
  use.
- Where to find deeper docs per module (the `docs/` tree was never
  linked from the README).

This change rewrites the root README into a single onboarding-grade
document and points at the existing `docs/` tree for per-module
deep dives.

## What

- Rewrite `README.md` to reflect the eleven shipped changes.
- Add the live URL table (frontend + per-service actuator + infra
  ports).
- Add a Quickstart (PowerShell) for `docker compose up -d` plus the
  health-check probes.
- Add the 11-change summary (6 backend + 5 frontend, with status,
  test count, and the URL they touch).
- Add a "Where to find more details" section that maps each module
  to its `docs/` Markdown.
- Correct the Tech Stack table (drop MUI / SockJS / Testcontainers
  / `lb://`, add `react-leaflet`, `@stomp/stompjs`, `leaflet.heat`,
  `preferencesStore`, `formatRole`).
- Add a "Repository layout" tree (the old README had it but stale).

## Out of scope

- No code change.
- No CI change.
- No `docs/` change — the existing per-module specs are already
  authoritative.
