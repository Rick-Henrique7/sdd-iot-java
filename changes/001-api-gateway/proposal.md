# Proposal — Change 001: api-gateway

> **Why this change exists. The problem we are solving and the value it unlocks.**

---

## Context

The Agro-IoT Integrated Platform is composed of 5 backend microservices
(`auth-service`, `fleet-mapping-service`, `telemetry-ingestion-service`,
`alert-processing-service`, plus future additions) and a Next.js
micro-frontend. Currently:

- Every public-facing route in the front-end would have to be aware of
  every internal service URL.
- JWT validation would have to be re-implemented in each downstream
  service, leaking authentication concerns into business code.
- There is no single place to enforce CORS, rate limiting, circuit
  breakers, or TLS termination.

This violates the "Single Point of Entry" contract documented in
`docs/backend/microservices-specification/api-gateway.md` and the
"Security Cross-Cutting" governance rule in
`docs/backend/guidelines-and-governance`.

## Goal

Introduce the **`api-gateway`** service as the only edge component
exposed to the outside world. It must:

1. Route REST traffic to the correct downstream microservice using
   Spring Cloud Gateway's reactive (WebFlux/Netty) engine.
2. Validate JWTs at the edge, forwarding identity headers
   (`X-User-Email`, `X-User-Roles`, `X-User-Id`) to internal services.
3. Centralize CORS for the Next.js shell app.
4. Provide a baseline for rate limiting and circuit breakers
   (Resilience4j), wired in but configurable per route.
5. Be observable via Spring Boot Actuator (`/actuator/health`).

## Non-Goals

- The `auth-service` itself is **not** part of this change (Change 002).
- No new business endpoints are added at the gateway layer.
- TLS termination in production is delegated to the cloud load balancer
  or Ingress controller; the gateway focuses on HTTP inside the cluster.

## Success Criteria

- An unauthenticated request to a protected route returns `401` without
  the request ever leaving the gateway.
- An authenticated request to `/api/v1/auth/**` is forwarded to
  `auth-service` with the original headers.
- All downstream services can be reached exclusively through the
  gateway from the front-end.
- The change ships with at least:
  - one JUnit 5 / WebTestClient test asserting `401` on missing token;
  - one JUnit 5 / WebTestClient test asserting `401` on malformed token.
- A multi-stage `Dockerfile` produces a runnable image based on
  `eclipse-temurin:17-jre-alpine` and runs as a non-root user.

## Risks

| Risk                                                              | Mitigation                                                |
|-------------------------------------------------------------------|-----------------------------------------------------------|
| JWT secret leakage via `application.yml` defaults                 | Default is overridden by `JWT_SECRET` env var in compose  |
| Inadvertent coupling to a specific auth-service implementation    | Gateway only depends on the JWT *contract* (claims)       |
| Reactor / WebFlux learning curve                                  | Reactive stack is mandated by Spring Cloud Gateway        |
| Bean ordering issues between Spring Security and custom filters   | Custom filter wired as a `GatewayFilterFactory`           |

## Stakeholders

- Platform Engineering — owns the edge tier.
- Front-end Team — consumes the gateway from the Next.js shell.
- AI Code Generators — must read this proposal/spec/design before
  proposing refactors.
