# Proposal — Change 002: auth-service

> **Why this change exists. The problem we are solving and the value it unlocks.**

---

## Context

The `api-gateway` (Change 001) now rejects every unauthenticated request
on protected routes with `401`. But the only way to obtain a JWT today
is to be given one — there is no path in the platform that *issues*
them. The whole authentication story stops at the gateway's edge.

In parallel, the `docs/backend/microservices-specification/auth-service.md`
already describes a complete, contract-defined service for user
management and JWT issuance. The spec has been waiting for an
implementation.

## Goal

Introduce the **`auth-service`** as the canonical identity provider for
the Agro-IoT platform. It MUST:

1. Expose `POST /api/v1/auth/login` and `POST /api/v1/auth/register`
   per the spec.
2. Persist user credentials (BCrypt-hashed) in the **isolated**
   `auth` schema of PostgreSQL, accessed only by the `agrio_auth` role.
3. Issue HS256 JWTs that satisfy the validation contract enforced by
   the `api-gateway` (Change 001): `sub` (email), `userId`, `roles`.
4. Follow Clean Architecture — the domain layer must not depend on
   Spring, JPA, or JJWT.

## Non-Goals

- Refresh tokens, password reset, MFA, OAuth2 / OpenID Connect.
- Multi-tenant identity. We keep a single-tenant model.
- Direct user CRUD endpoints (`GET /users`, `PATCH /users/{id}` etc.).
  The spec only requires login + register.

## Success Criteria

- `mvn -pl auth-service -am test` is green.
- The fat jar builds and the image is produced.
- A live `POST /api/v1/auth/register` + `POST /api/v1/auth/login`
  flow returns a JWT that the running `api-gateway` accepts on a
  protected route (i.e. `GET /api/v1/fleet` with the issued token
  returns `200`, not `401`).
- Roles `OPERADOR`, `AGRONOMO`, `GESTOR` are first-class citizens of
  the domain.

## Risks

| Risk                                                              | Mitigation                                                |
|-------------------------------------------------------------------|-----------------------------------------------------------|
| Plain-text passwords in logs                                      | `BCryptPasswordEncoder`; no log lines include the raw pwd |
| JWT secret in `application.yml`                                   | Override via `JWT_SECRET` env var in compose / K8s        |
| Domain layer leaking Spring/JPA                                   | Code review + the `task #validation` checklist            |
| Race condition on duplicate email                                 | `users.email` has a UNIQUE constraint                     |

## Stakeholders

- Platform Engineering — owns the edge tier.
- Front-end Team — consumes the login flow from the Next.js shell.
- Operations — owns secret management via env / K8s secrets.
