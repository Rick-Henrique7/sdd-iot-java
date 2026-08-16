# Change 017 — frontend-polish-and-docs-prep (archived 2026-08-16)

## Status

✅ **Shipped to `main` via PR #15** (squash-merge commit `215bc0c5`).
✅ All 3 CI jobs green: `Validate SDD artifacts`, `Build & test (Maven)`,
`Build & test (frontend-shell)`.

## What was in the PR

PR #15 consolidated **two commits** that piled up after Change 013 was
merged (`ca0f1474`):

### Commit 1 — `90643fd`: chore(frontend): dashboard overflow fix, global telemetry mount, mapping polish, docs prep

**Bug fixes (4):**

- `Dashboard.tsx` — added `min-h-0 overflow-hidden` on each grid cell so the
  `AlertPanel` no longer overflows the chart panel when many alerts arrive
  (root cause: CSS grid items default to `min-height: auto` which grew
  past the row's `h-[600px]`).
- `(app)/layout.tsx` + new `TelemetryStreamMount.tsx` — lifted the STOMP
  subscription from a per-page HOC (`withTelemetryStream`) to a layout-level
  mount. The `telemetryStore` / `alertsStore` now survive page navigation,
  so `TractorMarker` stays populated on `/mapping`.
- `tailwind.config.ts` — content paths extended to cover `src/modules`,
  `src/hooks`, `src/stores`, `src/lib` (classes were silently purged in
  those trees).
- `api.test.ts` — hardened against `TS18048` (`handlers` may be `undefined`
  in strict mode).

**Polish (4):**

- `Mapping.tsx` + `OpenMeteoWidget.tsx` — `OpenMeteoWidget` becomes a
  horizontal bar at the top of the main content area; toolbar `Switch`
  grows a column to show heatmap status text.
- `Fleet.tsx` — dropped the "Change 009" badge from the header.
- `SessionCard.tsx` + `ThresholdForm.tsx` — aligned icon + label inside
  the `Button` component.

**Docs prep (5 new files):**

- `docs/backend/microservices-specification/field-operation-service.md` —
  full spec for the new WorkOrder + Downtime microservice.
- `docs/frontend/operator-profile-and-gestor-sidebar.md` — UI/UX blueprint
  for `/operator/workspace` + 6-tab Sidebar expansion.
- `changes/014-readme-update-for-new-services/tasks.md` — placeholder for
  the README update that will follow the `field-operation-service` merge.
- `changes/015-readme-update-for-frontend-role-expansion/tasks.md` —
  placeholder for the README update that will follow the operator profile
  merge.
- `changes/016-docker-sql-verification/tasks.md` — pre/post-merge checklist
  to ensure `docker-compose.yml` and `init.sql` are updated correctly.

### Commit 2 — `e477f95`: chore(sdd): add proposal/spec/design for 014, 015, 016 placeholder tasks

The CI guardrail `Validate SDD artifacts` requires every active folder
under `changes/` matching `[0-9]*-*` to have all four artifacts
(`proposal.md`, `spec.md`, `design.md`, `tasks.md`). The 014/015/016
folders created in commit 1 only had `tasks.md`, which made the guardrail
fail with 9 missing artifacts. This commit added the missing
`proposal.md` / `spec.md` / `design.md` to each placeholder folder.

## Verification (local + CI)

| Check                            | Local                | CI           |
| -------------------------------- | -------------------- | ------------ |
| `npx tsc --noEmit`               | 0 errors             | (n/a)        |
| `npm test` (vitest)              | 52/52 in 11 files    | (n/a)        |
| `npm run build`                  | 10/10 static pages   | (n/a)        |
| `npm run lint --max-warnings 0`  | clean                | (n/a)        |
| `Validate SDD artifacts`         | (n/a)                | ✅ success   |
| `Build & test (Maven)`           | (n/a)                | ✅ success   |
| `Build & test (frontend-shell)`  | (n/a)                | ✅ success   |

## Files changed

24 files changed, 1326 insertions(+), 79 deletions(-).

## Why no `proposal.md` / `spec.md` / `design.md` / `tasks.md` in this folder

The convention in this repo is to keep the four SDD artifacts inside the
change folder before shipping. Change 017 was a **post-013 cleanup +
documentation preparation** rather than a new feature, so the four artifacts
were distributed across:

- `docs/backend/microservices-specification/field-operation-service.md` (the
  spec for the upcoming backend service)
- `docs/frontend/operator-profile-and-gestor-sidebar.md` (the spec for the
  upcoming UI/UX work)
- The 014/015/016 folders (placeholder tasks for the maintenance PR that
  will follow the upcoming features)

This `archive.md` is the retrospective entry that records what PR #15
actually shipped.

## Next planned change

- **Change 018** (TBD): implement `field-operation-service` (backend
  microservice) following the spec at
  `docs/backend/microservices-specification/field-operation-service.md`.
- **Change 019** (TBD): implement `operator/workspace` + 6-tab Sidebar
  expansion following the spec at
  `docs/frontend/operator-profile-and-gestor-sidebar.md`.
- After both land, the maintenance tasks in `changes/014`, `changes/015`,
  and `changes/016` should be executed in a single PR that updates the
  root `README.md`, the `docker-compose.yml`, and the `init.sql` files.
