# Change 019 — field-operation-service (archived 2026-08-16)

## Status

✅ **Shipped to `main` via PR #17** (squash-merge commit `68950e2b`).
✅ All 3 CI jobs green: `Validate SDD artifacts`, `Build & test (Maven)`,
`Build & test (frontend-shell)`.

## What was in the PR

PR #17 implemented the sixth backend microservice per
`docs/backend/microservices-specification/field-operation-service.md`.

### 1 commit (squashed from `e1bb59c`)

- 1 new Spring Boot 3.3.4 / Java 17 module
- 1 new Flyway migration (schema `operations` + tables `work_orders`,
  `downtime_records`)
- 1 new Docker container (`agrio-field-operation`, port 8085)
- 1 new Postgres role (`agrio_operations`)
- 1 new Kafka topic (`agri.operations.events`)
- 1 new route in `api-gateway` (`/api/v1/operations/**`)
- 4 SDD artifacts in `changes/019-field-operation-service/`

**39 files changed, 1844 insertions(+), 2 deletions(-).**

## Architecture

```
field-operation-service/
├── domain/       (WorkOrder, WorkOrderStatus, DowntimeRecord, DowntimeReason, OperationDomainService)
├── usecase/      (CreateWorkOrderUseCase, RecordDowntimeUseCase, UpdateWorkOrderStatusUseCase)
├── infrastructure/
│   ├── config/   (ClockConfig UTC, SecurityConfig pass-through)
│   ├── messaging/ (OperationEventPublisher — Kafka best-effort)
│   └── persistence/ (WorkOrderEntity, DowntimeEntity + JPA repos)
└── adapters/
    ├── dto/      (WorkOrderDTO, DowntimeDTO, OperationEventDTO)
    └── controller/ (WorkOrderController, DowntimeController)
```

## REST API

| Method | Path                                              | Status | Description |
| ------ | ------------------------------------------------- | ------ | ----------- |
| POST   | `/api/v1/operations/downtime`                     | 201    | Operator records a pause |
| PATCH  | `/api/v1/operations/work-orders/{id}/status`      | 200    | Operator updates WO status |
| GET    | `/actuator/health`                                | 200    | Docker healthcheck |

## Verification

| Check                                       | Result                  |
| ------------------------------------------- | ----------------------- |
| `npm test` (vitest)                         | 52/52 across 11 files   |
| `mvnw -pl field-operation-service -am test` | **11/11**               |
| `mvnw -pl api-gateway -am compile`          | OK                      |
| `docker compose config --quiet`             | exit 0                  |
| CI `Validate SDD artifacts`                 | ✅ success              |
| CI `Build & test (Maven)`                   | ✅ success              |
| CI `Build & test (frontend-shell)`          | ✅ success              |

## Test breakdown

| Test class                                               | Type         | Count |
| ------------------------------------------------------- | ------------ | ----- |
| `WorkOrderTest`                                          | unit (POJO)  | 5     |
| `CreateWorkOrderUseCaseTest`                             | unit (Mockito) | 2   |
| `RecordDowntimeUseCaseTest`                              | unit (Mockito) | 2   |
| `WorkOrderControllerIntegrationTest`                     | e2e (`@SpringBootTest`) | 1 |
| `DowntimeControllerIntegrationTest`                      | e2e (`@SpringBootTest`) | 1 |
| **Total**                                                |              | **11** |

## Post-merge trigger

After this merge, the following placeholder tasks are now ready to be
executed (in a single maintenance PR):

- `changes/014-readme-update-for-new-services/tasks.md` — README update
- `changes/015-readme-update-for-frontend-role-expansion/tasks.md` — UI/UX README update
- `changes/016-docker-sql-verification/tasks.md` — docker-compose + init.sql check
- `changes/020-design-system-and-interfaces/tasks.md` — design system

## Related

- Spec: `docs/backend/microservices-specification/field-operation-service.md`
- Companion spec: `docs/frontend/operator-profile-and-gestor-sidebar.md`
- PR: #17
- Commit: `68950e2b2d1971c1336659c99bb882eae99d898e`
