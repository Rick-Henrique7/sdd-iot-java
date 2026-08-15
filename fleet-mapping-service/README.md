# fleet-mapping-service

**Status:** scaffold only — implementation tracked in **Change 005**.

## Responsibility
CRUD for equipment (tractors, harvesters, sprayers), management of
field-plot polygons, and heatmap data queries powering the
`leaflet.heat` layer on the Next.js front-end. Persists in PostgreSQL
schema `fleet` via a restricted role.

## Source of truth
- Spec: `docs/backend/microservices-specification/fleet-mapping-service.md`
- Change artifacts: `changes/005-fleet-mapping-service/` (TBD)

## Key contracts
- `GET  /api/v1/fleet`            → `List<EquipmentDTO>`
- `POST /api/v1/fleet`            → `EquipmentDTO` (201)
- `GET  /api/v1/mapping/heatmaps` → `List<HeatmapPointDTO>`

## Module layout (planned)
```
fleet-mapping-service/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/java/com/johndeere/agrio/fleet/
    │   ├── FleetMappingApplication.java
    │   ├── domain/ (Equipment, EquipmentStatus, FieldPlot, FleetDomainService)
    │   ├── usecase/ (RegisterEquipmentUseCase, ListFleetUseCase, GetHeatmapDataUseCase)
    │   ├── infrastructure/ (config/SecurityConfig, persistence/...)
    │   └── adapters/ (controller/..., dto/...)
    └── test/
```
