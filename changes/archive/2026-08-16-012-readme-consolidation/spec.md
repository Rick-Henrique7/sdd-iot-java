# Change 012 — README consolidation (spec)

## Spec

### Functional requirements

- Section 1 of `README.md` lists **every** public URL the platform
  serves at `localhost`, grouped by concern (frontend, gateway,
  per-service health, infra ports).
- Section 1 includes a copy-pasteable PowerShell Quickstart that
  brings the stack up from zero and probes every health endpoint.
- Section 1 includes the `dash@agrio.io` test credential and notes
  that `/register` is open for self-service sign-up.
- Section 4 contains an 11-row table — one row per change — with
  the change number, slug, status (`merged`), short summary, and
  the backend services / frontend routes the change touches.
- Section 5 maps each `docs/` subtree to the modules it documents
  (`docs/general-vision/`, `docs/backend/microservices-specification/`,
  `docs/backend/guidelines-and-governance/`, `docs/frontend/`).
- Section 6 contains an up-to-date Repository layout tree that
  matches the current on-disk structure (including the
  `changes/archive/2026-08-15-*` entries for 008–011).
- Section 3 Tech Stack table drops anything that is no longer in
  use (MUI, SockJS, Testcontainers, `lb://`) and adds the current
  libraries (`react-leaflet`, `@stomp/stompjs`, `leaflet.heat`,
  `preferencesStore`, `formatRole`).

### Non-functional requirements

- Single file change: `README.md`.
- No code or CI change.
- Markdown renders cleanly on GitHub (no broken anchors, no broken
  relative paths).

### Acceptance criteria

- `README.md` opens in a GitHub preview and renders the full
  11-change table, the URL matrix, the Quickstart, and the
  `docs/` map.
- Every relative link in the README (`docs/...`, `changes/...`,
  `.github/...`, `CONTRIBUTING.md`, `LICENSE`) resolves to a file
  that exists on disk in this branch.
