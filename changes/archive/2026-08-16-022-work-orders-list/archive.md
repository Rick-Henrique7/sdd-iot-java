# Change 022 — work-orders-list (archived 2026-08-16)

## Status

✅ **Shipped to `main` via PR #20** (squash-merge commit `dd475dbc`).
✅ All 3 CI jobs green: `Validate SDD artifacts`, `Build & test (Maven)`,
`Build & test (frontend-shell)`.

## What was in the PR

PR #20 added **GET endpoints** to `field-operation-service` and
wired the front to the previously-stubbed `/operations` and
`/maintenance` pages (Change 021 placeholders now show real data).

### 1 commit (squashed from `b2ef7aa`)

**Backend (`field-operation-service`):**
- `GET /api/v1/operations/work-orders?status=&equipmentId=&page=&size=` (paginated)
- `GET /api/v1/operations/work-orders/{id}` (404 via `WorkOrderNotFoundException`)
- `GET /api/v1/operations/downtime?equipmentId=&page=&size=` (paginated)
- 3 new use cases: `ListWorkOrdersUseCase`, `GetWorkOrderByIdUseCase`, `ListDowntimeRecordsUseCase`
- `PageResponseDTO<T>` generic envelope (replaces Spring `Page` in JSON)
- `EntityMappers` `@Component` (centralizes `toDomain` for both entities)
- `ApiExceptionHandler` maps `WorkOrderNotFoundException` → 404 `WO_NOT_FOUND`
- Derived queries in JPA repos (no `@Query` custom)
- +1 e2e test (list + getById + 404)
- 13/13 backend tests pass (was 11)

**Frontend (`frontend-shell`):**
- New `modules/work-orders/`: `useWorkOrdersQuery` (polling 10s), `WorkOrdersTable` (id, equipment, status badge, created, operator)
- New `modules/downtime/`: `useDowntimeQuery` (polling 15s), `DowntimeTable` (equipment, reason, started, ended, duration)
- `/operations` page now renders real data
- `/maintenance` page now renders real data
- Header badges simplified to icon-only (no more "Change 021 (placeholder)")
- 4 new vitest tests (2 per table); 67/67 frontend tests pass (was 63)

**Other:**
- `package.json`: `@testing-library/dom` added to `devDependencies` (was transitive; now explicit to survive clean installs)
- README: subtitle 21→22, Vitest badge 63→67, §3 58 backend + 67 frontend, §4 entry 022, §8.1 119→125 total
- Chore commit `0bce267`: removed leftover live 021 folder

## Verification

| Check                                       | Result                    |
| ------------------------------------------- | ------------------------- |
| `mvnw -pl field-operation-service test`     | **13/13**                 |
| `mvnw -B verify`                            | **58/58** (full backend)  |
| `npm test` (vitest)                         | **67/67**                 |
| `npm run lint`                              | 0 errors, 0 warnings      |
| `npm run build`                             | **13/13** static pages    |
| CI `Validate SDD artifacts`                 | success                   |
| CI `Build & test (Maven)`                   | success (58/58)           |
| CI `Build & test (frontend-shell)`          | success (67/67)           |

## Test breakdown (new tests)

| Test class                                 | Type       | Count |
| ------------------------------------------ | ---------- | ----- |
| `WorkOrdersTable.test.tsx`                 | RTL        | 2     |
| `DowntimeTable.test.tsx`                   | RTL        | 2     |
| `WorkOrderControllerIntegrationTest` (new) | e2e        | +1    |
| **Total new**                              |            | **5** |

## REST API surface (final, post-022)

| Method | Path                                              | Status | Description                       |
| ------ | ------------------------------------------------- | ------ | --------------------------------- |
| POST   | `/api/v1/operations/downtime`                     | 201    | Operator records a pause          |
| GET    | `/api/v1/operations/downtime`                     | 200    | List downtime (paginated)         |
| POST   | `/api/v1/operations/work-orders`                  | 201    | Create WO                         |
| PATCH  | `/api/v1/operations/work-orders/{id}/status`      | 200    | Update WO status                  |
| GET    | `/api/v1/operations/work-orders`                  | 200    | List WOs (paginated, filterable)  |
| GET    | `/api/v1/operations/work-orders/{id}`             | 200/404| Get one WO by id                  |
| GET    | `/actuator/health`                                | 200    | Docker healthcheck                |

## Related

- Predecessor: Change 021 (frontend-operator-workspace + the stubs we just filled)
- Spec ref: `docs/backend/microservices-specification/field-operation-service.md` (now needs a `GET endpoints` section)
- PR: #20
- Commit: `dd475bcdb16baaa912534eb00b0c8a12cb8b540`
- Next: Change 023 (TBD — WebSocket push for real-time WO updates, or date-range filters)
