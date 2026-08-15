# Tasks — Change 005: fleet-mapping-service

> **Implementation checklist. Each task is small, testable, and ends with a verifiable artifact.**

Format: `[ ]` not started · `[~]` in progress · `[x]` done

---

## 1. SDD artifacts

- [x] `changes/005-fleet-mapping-service/proposal.md`
- [x] `changes/005-fleet-mapping-service/spec.md`
- [x] `changes/005-fleet-mapping-service/design.md`
- [x] `changes/005-fleet-mapping-service/tasks.md`

## 2. Build & module wiring

- [x] `<module>fleet-mapping-service</module>` already in parent `pom.xml`.
- [x] `fleet-mapping-service/pom.xml` with web, validation, jpa, actuator.

## 3. Domain (no Spring / JPA / Web)

- [x] `domain/model/EquipmentType.java` — enum.
- [x] `domain/model/EquipmentStatus.java` — enum.
- [x] `domain/model/GeoPoint.java`.
- [x] `domain/model/Equipment.java` — POJO.
- [x] `domain/model/FieldPlot.java` — POJO.
- [x] `domain/service/FleetDomainService.java` — Haversine area.

## 4. Use cases

- [x] `usecase/RegisterEquipmentUseCase.java`.
- [x] `usecase/ListFleetUseCase.java`.
- [x] `usecase/GetHeatmapDataUseCase.java`.

## 5. Infrastructure

- [x] `infrastructure/config/SecurityConfig.java`.
- [x] `infrastructure/persistence/EquipmentEntity.java`.
- [x] `infrastructure/persistence/EquipmentJpaRepository.java`.
- [x] `infrastructure/persistence/FieldPlotEntity.java`.
- [x] `infrastructure/persistence/FieldPlotJpaRepository.java`.
- [x] `infrastructure/persistence/EntityMappers.java`.

## 6. Adapters

- [x] `adapters/dto/EquipmentDTO.java`.
- [x] `adapters/dto/FieldPlotDTO.java` + `GeoPointDTO.java`.
- [x] `adapters/dto/HeatmapPointDTO.java`.
- [x] `adapters/controller/FleetController.java`.
- [x] `adapters/controller/MappingController.java`.
- [x] `adapters/controller/ApiExceptionHandler.java`.

## 7. Configuration

- [x] `application.yml` (default + docker + test profiles).

## 8. Tests

- [x] `RegisterEquipmentUseCaseTest` — unit, 3 cases.
- [x] `ListFleetUseCaseTest` — unit, 2 cases.
- [x] `GetHeatmapDataUseCaseTest` — unit, 3 cases.
- [x] `FleetControllerIntegrationTest` — `@WebMvcTest`, 3 cases.

## 9. Container

- [x] `Dockerfile` (multi-stage, non-root, JRE 17 alpine).

## 10. Docker compose

- [x] Uncomment the `fleet-mapping-service` block in `docker-compose.yml`.

## 11. Validation

- [x] `.\mvnw.cmd -pl fleet-mapping-service -am test` is green.
- [x] `docker compose build fleet-mapping-service` succeeds.
- [x] `docker compose up -d fleet-mapping-service` brings the service up healthy.
- [x] End-to-end: `POST /api/v1/fleet` then `GET /api/v1/fleet` returns the row; `GET /api/v1/mapping/heatmaps?fieldId=…` returns the deterministic array.

## 12. Archive

- [ ] After all validation passes, move `changes/005-fleet-mapping-service/` to `changes/archive/2026-08-15-005-fleet-mapping-service/`.

---

## Acceptance checklist (final go/no-go)

- [ ] No code under `domain/` references Spring, JPA, or Web APIs.
- [ ] All tests pass.
- [ ] Docker image builds and runs as non-root.
- [ ] End-to-end: register → list returns it; heatmap deterministic.
