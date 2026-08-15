# Design — Change 001: api-gateway

> **Technical decisions, trade-offs, and how the spec is realized in code.**

---

## 1. Build System

- **Parent POM** at the repo root (`pom.xml`) declares the 5 backend
  modules, dependency management (Spring Cloud BOM, JJWT, Resilience4j,
  Testcontainers), and a pinned Java 17 toolchain.
- **`api-gateway/pom.xml`** is a thin module that:
  - Inherits from the parent.
  - Adds `spring-cloud-starter-gateway` (reactive).
  - Adds `jjwt-api` (compile) + `jjwt-impl` + `jjwt-jackson` (runtime).
  - Adds `resilience4j-spring-boot3` (compile) so future changes can
    enable breakers per route.
  - Adds `spring-boot-starter-actuator` (compile).
  - Adds `spring-boot-starter-test` + `reactor-test` (test).
- **No JPA, no JDBC, no Kafka** — the gateway is a pure edge component.

## 2. Module Layout

```
api-gateway/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/
    │   ├── java/com/johndeere/agrio/gateway/
    │   │   ├── ApiGatewayApplication.java
    │   │   ├── config/
    │   │   │   ├── CorsConfig.java
    │   │   │   └── SecurityConfig.java
    │   │   └── filter/
    │   │       └── JwtAuthenticationFilter.java
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/johndeere/agrio/gateway/
            ├── ApiGatewayApplicationTests.java
            └── filter/JwtAuthenticationFilterTest.java
```

## 3. Filter Implementation

`JwtAuthenticationFilter` is a `GatewayFilterFactory<Config>` registered
as a Spring component. Spring Cloud Gateway auto-discovers it; the
filter is referenced by simple name (`JwtAuthenticationFilter`) in
`application.yml`.

The filter is purely reactive:

- Reads `Authorization` via `exchange.getRequest().getHeaders()`.
- On failure, writes the status code and returns
  `exchange.getResponse().setComplete()`.
- On success, mutates the request with `X-User-*` headers, **removes**
  the original `Authorization` header, and chains
  `exchange.mutate().request(...).build()`.

## 4. JWT Parsing

- We use JJWT 0.12.x API: `Jwts.parser().verifyWith(key).build().parseSignedClaims(token)`.
- The secret is a 256-bit (32+ bytes) UTF-8 string. We refuse to start
  if the secret is shorter than 32 bytes (defense-in-depth — though
  JJWT would throw at first use).
- We do **not** allow `none` or asymmetric algorithms in this change.
  The parser is configured with `verifyWith(key)` only.

## 5. CORS

- Implemented via Spring Cloud Gateway's `globalcors` block in
  `application.yml` (per spec). A `CorsConfig` bean is **not** required
  when using gateway's reactive CORS handling, but the file is reserved
  for future WebFlux-specific CORS refinements (e.g. dynamic origins).
- CORS is **additive** to the JWT filter, not a substitute.

## 6. Error Responses

The gateway's `401` response has an empty body and
`Content-Length: 0`. This is intentional and consistent with the spec
provided in `docs/backend/microservices-specification/api-gateway.md`.
Detailed error bodies are the responsibility of the downstream
service.

## 7. Containerization

Multi-stage build:

1. `maven:3.9-eclipse-temurin-17` — dependency cache, then
   `mvn package -DskipTests`.
2. `eclipse-temurin:17-jre-alpine` — runtime with non-root user
   `appuser`.

## 8. Testing Strategy

- **Context load test** — `ApiGatewayApplicationTests#contextLoads`
  boots the application context to catch wiring errors.
- **Reactive contract test** —
  `JwtAuthenticationFilterTest` uses `WebTestClient` against a
  `@SpringBootTest(webEnvironment = RANDOM_PORT)` to assert:
  - `GET /api/v1/fleet` without `Authorization` → `401`.
  - `GET /api/v1/fleet` with malformed `Bearer` token → `401`.
- **No Mockito on the filter** — we test the wired behavior, not the
  implementation. The filter is the contract surface.

## 9. Open Questions / Follow-ups

| Question                                                       | Owner           | Tracked in           |
|----------------------------------------------------------------|-----------------|----------------------|
| Should we add a `/api/v1/alerts/**` WebSocket passthrough?     | Platform Eng.   | Future change        |
| Move JWT secret to a K8s Secret + sealed-secrets               | Platform Eng.   | `k8s/secrets.yaml`   |
| Add Resilience4j circuit breakers per route                    | Platform Eng.   | Future change        |
| Add distributed tracing (Micrometer + Zipkin)                  | Platform Eng.   | Future change        |
