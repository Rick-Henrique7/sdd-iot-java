# Spec — Change 005: fleet-mapping-service

> **Behavioral contract. What the fleet-mapping-service MUST do. This is the single source of truth for behavior.**

---

## 1. Endpoints

| Method | Path                                  | Auth   | Body                | Response                              |
|--------|---------------------------------------|--------|---------------------|---------------------------------------|
| GET    | `/api/v1/fleet`                       | NO     | —                   | `200 OK` · `List<EquipmentDTO>`       |
| POST   | `/api/v1/fleet`                       | NO     | `EquipmentDTO`      | `201 Created` · `EquipmentDTO`        |
| GET    | `/api/v1/mapping/heatmaps?fieldId=…` | NO     | —                   | `200 OK` · `List<HeatmapPointDTO>`    |

The api-gateway already routes `/api/v1/fleet/**` and
`/api/v1/mapping/**` through the `JwtAuthenticationFilter`. The
fleet-mapping-service does not re-validate the JWT (the gateway
removes the original `Authorization` header and forwards
`X-User-Email` / `X-User-Roles` if a future change wants them).

## 2. Equipment DTO

```json
{
  "id": "TRAC-7230J-001",
  "name": "Trator John Deere 7230J",
  "model": "7230J",
  "serialNumber": "1BM7230J00019283",
  "type": "TRACTOR",
  "status": "OPERATIONAL",
  "horometerHours": 1245.8,
  "lastMaintenanceDate": "2026-06-10"
}
```

- `id` is opaque (caller-supplied). The use case does not generate
  it.
- `type` is one of `TRACTOR`, `HARVESTER`, `SPRAYER`.
- `status` is one of `OPERATIONAL`, `MAINTENANCE`, `INACTIVE`.
- `lastMaintenanceDate` is `ISO-8601` (`yyyy-MM-dd`); `null` is
  allowed (no maintenance recorded yet).
- `horometerHours` is a non-negative double.

## 3. Field plot DTO (read-only in this change)

```json
{
  "id": "FLD-01",
  "name": "Talhão 01 - Soja",
  "polygon": [
    { "latitude": -21.170, "longitude": -47.810 },
    { "latitude": -21.171, "longitude": -47.808 },
    { "latitude": -21.172, "longitude": -47.811 },
    { "latitude": -21.170, "longitude": -47.812 }
  ],
  "areaHectares": 12.5
}
```

- `polygon` is a closed ring of lat/lng points. The first and
  last point are *expected* to coincide; the service does NOT
  enforce that (a future change validates topology).
- `areaHectares` is derived at the entity level (Haversine on
  the polygon) and is read-only via the public API.

## 4. Heatmap DTO

```json
{
  "latitude":  -21.1704,
  "longitude": -47.8103,
  "intensity":  0.85
}
```

`intensity` is in `[0.0, 1.0]`. The MVP implementation
deterministically generates a small array of points around the
centre of the requested `fieldId`. The points are *not* random
across requests — same `fieldId` returns the same array. This
keeps front-end snapshots stable.

## 5. Validation & errors

| Condition                              | Response                          |
|----------------------------------------|-----------------------------------|
| `POST /fleet` with missing required field | `400 Bad Request`             |
| `GET /mapping/heatmaps` without `fieldId` | `400 Bad Request`             |
| `fieldId` not in the registry (MVP)        | `200 OK` with `[]`             |
| Internal / unexpected error                | `500 Internal Server Error`    |

The error envelope matches the rest of the platform:
```json
{ "code": "FLEET_VALIDATION_ERROR", "message": "...", "timestamp": "..." }
```

## 6. Non-functional requirements

| NFR                | Target                                                       |
|--------------------|--------------------------------------------------------------|
| List endpoint p99  | < 100 ms against PostgreSQL local for ≤ 1 000 rows         |
| Cold memory        | < 256 MiB RSS at idle                                        |
| Container security | Non-root user, JRE 17 alpine, multi-stage build              |

## 7. Acceptance criteria

1. `mvn -pl fleet-mapping-service -am test` builds and all
   unit + slice tests pass.
2. The fat jar is produced and a Docker image can be built.
3. With the docker-compose stack up:
   - `POST /api/v1/fleet` registers a piece of equipment and
     returns `201` with the persisted DTO.
   - `GET /api/v1/fleet` returns the registered equipment.
   - `GET /api/v1/mapping/heatmaps?fieldId=FLD-01` returns the
     deterministic synthetic array.
4. The domain layer does not import Spring, JPA, or Web APIs.
