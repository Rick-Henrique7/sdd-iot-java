# Design — Change 005: fleet-mapping-service

> **Technical decisions, trade-offs, and how the spec is realized in code.**

---

## 1. Build system

`pom.xml` adds:

- `spring-boot-starter-web` — REST controllers.
- `spring-boot-starter-validation` — `@Valid` on request DTOs.
- `spring-boot-starter-actuator` — health probes.
- `spring-boot-starter-data-jpa` + `org.postgresql:postgresql` —
  JPA on PostgreSQL.
- `com.h2database:h2` (test) — no Docker needed for tests.

The service has **no Spring Security** — the api-gateway owns
JWT validation. The local `SecurityConfig` is a pass-through
(permitAll), mirroring the auth-service pattern.

## 2. Module layout

```
fleet-mapping-service/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/java/com/johndeere/agrio/fleet/
    │   ├── FleetMappingApplication.java
    │   ├── domain/
    │   │   ├── model/
    │   │   │   ├── Equipment.java
    │   │   │   ├── EquipmentStatus.java
    │   │   │   ├── EquipmentType.java
    │   │   │   ├── FieldPlot.java
    │   │   │   └── GeoPoint.java
    │   │   └── service/
    │   │       └── FleetDomainService.java
    │   ├── usecase/
    │   │   ├── RegisterEquipmentUseCase.java
    │   │   ├── ListFleetUseCase.java
    │   │   └── GetHeatmapDataUseCase.java
    │   ├── infrastructure/
    │   │   ├── config/
    │   │   │   └── SecurityConfig.java
    │   │   └── persistence/
    │   │       ├── EquipmentEntity.java
    │   │       ├── EquipmentJpaRepository.java
    │   │       ├── FieldPlotEntity.java
    │   │       ├── FieldPlotJpaRepository.java
    │   │       └── EntityMappers.java
    │   └── adapters/
    │       ├── controller/
    │       │   ├── FleetController.java
    │       │   ├── MappingController.java
    │       │   └── ApiExceptionHandler.java
    │       └── dto/
    │           ├── EquipmentDTO.java
    │           ├── FieldPlotDTO.java
    │           ├── HeatmapPointDTO.java
    │           └── GeoPointDTO.java
    └── test/java/com/johndeere/agrio/fleet/
        ├── usecase/RegisterEquipmentUseCaseTest.java
        ├── usecase/ListFleetUseCaseTest.java
        ├── usecase/GetHeatmapDataUseCaseTest.java
        └── controller/FleetControllerIntegrationTest.java
```

## 3. Domain layer (no Spring / JPA / Web)

- `Equipment` — pure POJO.
- `EquipmentType` — enum (`TRACTOR`, `HARVESTER`, `SPRAYER`).
- `EquipmentStatus` — enum (`OPERATIONAL`, `MAINTENANCE`, `INACTIVE`).
- `FieldPlot` — id, name, polygon, areaHectares.
- `GeoPoint` — `(latitude, longitude)` value object.
- `FleetDomainService` — provides the polygon-area calculation
  (Haversine on a closed ring).

## 4. Heatmap data — MVP

`GetHeatmapDataUseCase` generates a deterministic array of
`HeatmapPointDTO` for the requested `fieldId`. The algorithm:

- Centre point is derived from the `fieldId` hash code mapped
  to a bounded range around a fixed origin.
- Eight points are placed on a 0.001-degree-radius circle
  around the centre.
- Intensity oscillates between 0.6 and 1.0 using a deterministic
  function of the index and `fieldId`.

Same `fieldId` → same array on every call. This keeps front-end
snapshots stable while the real aggregation pipeline is built.

## 5. Use cases

- `RegisterEquipmentUseCase.execute(dto)` — translates DTO →
  domain → entity, saves, returns the saved DTO.
- `ListFleetUseCase.execute()` — lists all equipment, ordered
  by `id` for stable pagination.
- `GetHeatmapDataUseCase.execute(fieldId)` — returns a
  deterministic list of `HeatmapPointDTO`.

## 6. Infrastructure

- `SecurityConfig` — pass-through (`@EnableWebSecurity` with
  everything permitted, no authentication filter). Required
  so Spring Security does not auto-install the default login
  page or basic-auth on the actuator.
- `EquipmentEntity` — JPA mapping of `fleet.equipment`.
- `FieldPlotEntity` — JPA mapping of `fleet.field_plot`. The
  polygon is stored as a JSON string in a `TEXT` column
  (PostGIS-free MVP).
- `EntityMappers` — domain ↔ entity translation.

## 7. Configuration profiles

`application.yml` declares:

- **default** — H2 in-memory.
- **docker** — PostgreSQL on the compose network, schema `fleet`,
  restricted role `agrio_fleet`.
- **test** — H2 with `INIT=CREATE SCHEMA IF NOT EXISTS FLEET` so
  Hibernate can create the tables on first boot.

## 8. Testing strategy

- **`RegisterEquipmentUseCaseTest`** — unit, 3 cases.
- **`ListFleetUseCaseTest`** — unit, 2 cases.
- **`GetHeatmapDataUseCaseTest`** — unit, 3 cases (determinism,
  intensity bounds, return type).
- **`FleetControllerIntegrationTest`** — `@WebMvcTest` + `@MockBean`s,
  3 cases (list, register, validation error).

## 9. Open questions / follow-ups

| Question                                                       | Owner           | Tracked in           |
|----------------------------------------------------------------|-----------------|----------------------|
| Real heatmap aggregation from `telemetry.telemetry_events`     | Platform Eng.   | Future change        |
| Field-plot CRUD endpoints                                      | Front-end / API | Future change        |
| PostGIS for true polygon area + spatial queries                | Platform Eng.   | Future change        |
| Equipment update + inactivate endpoints                       | Front-end / API | Future change        |
| Flyway migrations                                             | Platform Eng.   | Future change        |
