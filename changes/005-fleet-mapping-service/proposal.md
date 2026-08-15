# Proposal — Change 005: fleet-mapping-service

> **Why this change exists. The problem we are solving and the value it unlocks.**

---

## Context

The platform's `telemetry-ingestion-service` (Change 003) is
consuming IoT packets and updating the Redis latest-state cache.
The `alert-processing-service` (Change 004) is generating alerts.
But there is **no service** today that:

- Holds the **fleet master data** (which equipment exists, its
  serial number, type, status, horometer).
- Holds the **field plot polygons** (the geographical boundaries
  where equipment operates).
- Serves the **heatmap data** the front-end's `leaflet.heat` layer
  needs to render spray / fertilizer application density.

The api-gateway already exposes `/api/v1/fleet/**` and
`/api/v1/mapping/**` as JWT-protected routes, but they currently
return `503` because no service is registered. The
`docs/backend/microservices-specification/fleet-mapping-service.md`
already defines the contract.

## Goal

Introduce the **`fleet-mapping-service`** to:

1. **Manage the fleet master data** — register, list, update, and
   inactivate equipment. Persist in PostgreSQL schema `fleet`.
2. **Manage field plots** — polygon coordinates per plot, plus
   derived area (a future change surfaces the full CRUD; this
   change ships the entity + read endpoint).
3. **Serve heatmap data** — return `HeatmapPointDTO[]` for the
   front-end's `leaflet.heat` layer. The MVP uses deterministic
   synthetic points keyed by `fieldId`; a follow-up change replaces
   the synthetic data with real aggregation over
   `telemetry.telemetry_events`.
4. Follow **Clean Architecture** — the domain layer must not import
   Spring, JPA, or Web APIs.

## Non-Goals

- REST endpoints for field-plot CRUD (read-only this change).
- Real telemetry aggregation for heatmap (synthetic data only).
- Authentication on the routes (the api-gateway is the security
  perimeter).
- File upload for plot polygons (JSON body only).

## Success Criteria

- `mvn -pl fleet-mapping-service -am test` is green.
- The fat jar builds and the Docker image is produced.
- A live `POST /api/v1/fleet` followed by `GET /api/v1/fleet`
  returns the new equipment.
- A live `GET /api/v1/mapping/heatmaps?fieldId=FLD-01` returns
  deterministic `HeatmapPointDTO[]` for the front-end.
- The domain layer does not import Spring, JPA, or Web APIs.

## Risks

| Risk                                                              | Mitigation                                                |
|-------------------------------------------------------------------|-----------------------------------------------------------|
| Heatmap MVP uses synthetic data, looks fake in the UI           | Clearly documented in design.md; real impl is a follow-up |
| Polygon geometry stored as JSON string (no PostGIS)             | Acceptable for MVP; PostGIS is a follow-up                |
| Domain layer leaking framework code                              | Code review + the validation checklist in `tasks.md`      |

## Stakeholders

- Platform Engineering — owns the fleet + mapping tier.
- Front-end Team — consumes the fleet list and heatmap.
- Operations — owns the equipment onboarding process.
