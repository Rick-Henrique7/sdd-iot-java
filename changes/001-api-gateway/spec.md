# Spec — Change 001: api-gateway

> **Behavioral contract. What the gateway MUST do. This is the single source of truth for behavior; any deviation is a defect.**

---

## 1. Routes

The gateway MUST expose exactly the following routes in this change.
Service IDs are referenced by their Spring Boot application name
(lowercase) and resolved via client-side load balancing (`lb://`).

| Order | Route ID                  | Path                                  | Target Service                  | Filters                                  | Public? |
|-------|---------------------------|---------------------------------------|---------------------------------|------------------------------------------|---------|
| 1     | `auth-service-public`     | `/api/v1/auth/**`                     | `lb://auth-service`             | (none)                                   | YES     |
| 2     | `fleet-mapping-service`   | `/api/v1/fleet/**`, `/api/v1/mapping/**` | `lb://fleet-mapping-service` | `JwtAuthenticationFilter`                | NO      |
| 3     | `telemetry-service`       | `/api/v1/telemetry/**`                | `lb://telemetry-ingestion-service` | `JwtAuthenticationFilter`              | NO      |
| 4     | `alert-processing-service`| `/api/v1/alerts/**`                   | `lb://alert-processing-service` | `JwtAuthenticationFilter`                | NO      |
| 5     | `actuator-public`         | `/actuator/health/**`, `/actuator/info`| (self)                          | (none)                                   | YES     |

> The service identifiers MUST match exactly the values configured in
> `spring.application.name` on each downstream service. This is
> enforced by integration smoke tests in subsequent changes.

## 2. JWT Validation Contract

The `JwtAuthenticationFilter` is a `GatewayFilterFactory` wired
exclusively to non-public routes.

### 2.1 Required behavior

| Scenario                                            | HTTP Response |
|-----------------------------------------------------|---------------|
| `Authorization` header missing                      | `401`         |
| `Authorization` header not starting with `Bearer `  | `401`         |
| Token present but signature invalid / malformed     | `401`         |
| Token expired                                       | `401`         |
| Token valid                                         | Forwarded     |

When a request is forwarded, the gateway MUST inject the following
headers *only* (no JWT in the upstream call):

- `X-User-Email` — value of the `sub` claim
- `X-User-Id`    — value of the `userId` claim (when present)
- `X-User-Roles` — value of the `roles` claim (when present)

The original `Authorization` header MUST be stripped before forwarding
to internal services.

### 2.2 Algorithm

- Algorithm: **HMAC-SHA-256** (`HS256`).
- Secret source: `jwt.secret` property, populated from the
  `JWT_SECRET` environment variable in Docker / Kubernetes.
- Library: `io.jsonwebtoken:jjwt` (`jjwt-api`, `jjwt-impl`,
  `jjwt-jackson`), aligned with the `auth-service` (Change 002).

### 2.3 Out of scope for this change

- Token issuance (Change 002: `auth-service`).
- Token revocation / block-list.
- Asymmetric (`RS256`) signing.

## 3. CORS

- Allowed origin (default): `http://localhost:3000` (the Next.js shell).
- Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
- Allowed headers: `*`.
- Credentials: `true`.
- The CORS configuration MUST be overridable via standard Spring
  properties in higher environments.

## 4. Resilience (baseline)

The gateway MUST declare Resilience4j dependencies in this change so
that future changes can attach circuit breakers / rate limiters per
route via configuration alone. No breaker policy is enabled by
default in this change — the baseline must work without it.

## 5. Observability

- The Spring Boot Actuator endpoint `/actuator/health` MUST return
  `200 OK` with `{"status":"UP"}` when the gateway is healthy.
- `/actuator/health/liveness` and `/actuator/health/readiness` MUST
  be exposed for Kubernetes probes.

## 6. Non-Functional Requirements

| NFR                | Target                                                       |
|--------------------|--------------------------------------------------------------|
| Startup time       | < 10s on a developer laptop                                  |
| Cold memory        | < 256 MiB RSS at idle                                        |
| Throughput         | ≥ 5,000 req/s on a `2 vCPU / 2 GiB` instance (smoke target)  |
| Authentication     | JWT validation must be reactive and non-blocking             |
| Container security | Runs as non-root (`appuser`), based on `eclipse-temurin:17-jre-alpine` |

## 7. Acceptance Criteria

1. `mvn -pl api-gateway clean package` builds without errors.
2. `mvn -pl api-gateway test` runs and passes.
3. Starting the application with no infra dependencies, the actuator
   health endpoint returns `200 UP`.
4. A request to `/api/v1/fleet` without a token returns `401`.
5. A request to `/api/v1/fleet` with a malformed token returns `401`.
6. The gateway starts successfully with the secret read from the
   `JWT_SECRET` environment variable.
