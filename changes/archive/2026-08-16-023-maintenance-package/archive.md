# Change 023 — Maintenance Package (Archived)

**Shipped via**: PR #21 (`docs+infra: ship Change 023 - maintenance package + remove "John Deere" prose (#21)`)
**Merge commit**: `8cfff062bdc305d16b2bf72f6de8bbf472891483`
**Branch**: `023-maintenance-readme-docker-sql` → `main` (squash-merged)
**Date**: 2026-08-16

## What shipped

This change is a **consolidation of the dormant placeholders 014 + 015 + 016** plus an
inline docs cleanup. No new business code, no new endpoints — pure documentation and
infrastructure hygiene.

### Bundled placeholders

| Folder | Topic | Status |
|---|---|---|
| `014-readme-update-for-new-services` | README updates reflecting 6 backend services (auth, telemetry, alert, fleet, sim, ops) | bundled into 023 |
| `015-readme-update-for-frontend-role-expansion` | README updates reflecting 3-role frontend (Operador / Agrônomo / Gestor) | bundled into 023 |
| `016-docker-sql-verification` | Docker stack validation + SQL init verification across the 12-container compose | bundled into 023 |

### Active change

- `023-maintenance-readme-docker-sql` — the consolidation itself

### Bonus (single extra commit on the PR)

- Removed "John Deere" prose references from `README.md` and `docs/` per project
  policy. Java package paths `com.johndeere.agrio.*` are real code identifiers and
  were intentionally left untouched. 6 files / 9 lines changed:
  - `README.md` (2 lines)
  - `docs/general-vision/system-overview.md` (1 line)
  - `docs/frontend/blueprint.md` (2 lines)
  - `docs/frontend/struct-frontend.md` (1 line)
  - `docs/frontend/design-system-and-interfaces.md` (2 lines)
  - `docs/frontend/operator-profile-and-gestor-sidebar.md` (1 line)

## Code changes in the merged commit

```
docker-compose.yml         | 42 ++++++   (healthchecks on all 12 containers)
README.md                  | 4 +-
docs/frontend/blueprint.md | 4 +-
docs/frontend/design-system-and-interfaces.md | 4 +-
docs/frontend/operator-profile-and-gestor-sidebar.md | 2 +-
docs/frontend/struct-frontend.md | 2 +-
docs/general-vision/system-overview.md | 2 +-
```

`docker-compose.yml` gains `healthcheck:` blocks on:

- `api-gateway` (port 8080)
- `auth-service` (port 8083)
- `telemetry-ingestion-service` (port 8081)
- `alert-processing-service` (port 8082)
- `fleet-mapping-service` (port 8084)
- `field-operation-service` (port 8085)
- `frontend-shell` (port 3000)

Pattern (backend): `wget -qO- http://localhost:PORT/actuator/health | grep -q UP || exit 1`
Pattern (frontend): `wget -qO- http://localhost:3000/login | grep -q -i login || exit 1`

All healthchecks use `interval: 30s, timeout: 5s, retries: 5, start_period: 60s`.

## CI validation

- `Validate SDD artifacts` — success
- `Build & test (Maven)` — success (58/58 backend tests)
- `Build & test (frontend-shell)` — success (67/67 frontend tests, 0 lint errors)

## Artifacts preserved

All 4 SDD artifacts for each of the 4 bundled changes are preserved here
(16 files total, prefixed by change number to avoid collisions).

## Historical context

- 22 changes shipped to `main` before this one: 001–013, 017–022
- This was the last "consolidation" change after the feature sprint
- After this merge, the live working tree had 4 leftover placeholder folders
  (`014/`, `015/`, `016/`, `023/`). They were removed in a follow-up commit
  (this archive is the only record of them).
