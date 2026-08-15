# Design — Change 002: auth-service

> **Technical decisions, trade-offs, and how the spec is realized in code.**

---

## 1. Build system

`auth-service/pom.xml` inherits from the parent and adds:

- `spring-boot-starter-web` — REST controllers (servlet stack; not reactive).
- `spring-boot-starter-security` — for `BCryptPasswordEncoder` only.
- `spring-boot-starter-data-jpa` — JPA + Hibernate.
- `spring-boot-starter-validation` — `@Valid` on request DTOs.
- `spring-boot-starter-actuator` — health probes.
- `jjwt-api` (compile), `jjwt-impl` + `jjwt-jackson` (runtime) — same version as the gateway.
- `org.postgresql:postgresql` (runtime) — JDBC driver.

Tests use H2 in-memory to avoid pulling Testcontainers for the first
slice; a Testcontainers-based integration test can land in Change 003
when the ingestion service introduces the Postgres pattern.

## 2. Module layout (Clean Architecture)

```
auth-service/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/java/com/johndeere/agrio/auth/
    │   ├── AuthApplication.java
    │   ├── domain/
    │   │   ├── model/
    │   │   │   ├── User.java
    │   │   │   └── UserRole.java
    │   │   └── service/
    │   │       └── PasswordEncoderService.java
    │   ├── usecase/
    │   │   ├── AuthenticateUserUseCase.java
    │   │   └── RegisterUserUseCase.java
    │   ├── infrastructure/
    │   │   ├── config/
    │   │   │   └── SecurityConfig.java
    │   │   ├── security/
    │   │   │   └── JwtProvider.java
    │   │   └── persistence/
    │   │       ├── UserEntity.java
    │   │       └── UserJpaRepository.java
    │   └── adapters/
    │       ├── controller/AuthController.java
    │       └── dto/
    │           ├── LoginRequestDTO.java
    │           ├── RegisterRequestDTO.java
    │           ├── AuthResponseDTO.java
    │           └── UserSummaryDTO.java
    └── test/java/com/johndeere/agrio/auth/
        ├── usecase/AuthenticateUserUseCaseTest.java
        └── controller/AuthControllerIntegrationTest.java
```

### 2.1 Domain layer (no Spring / JPA / JJWT)

- `User` — pure POJO holding `(id, name, email, passwordHash, role)`.
- `UserRole` — enum `OPERADOR`, `AGRONOMO`, `GESTOR` (each with a
  `ROLE_*` `name()`).
- `PasswordEncoderService` — domain-level interface with two methods
  (`encode(raw)` and `matches(raw, hash)`). Implemented in
  `infrastructure.security.BcryptPasswordEncoderAdapter`.

This way the use case depends on the interface only and can be unit
tested with a hand-rolled fake.

### 2.2 Use cases

- `AuthenticateUserUseCase` — looks up by email, verifies password,
  returns a `User` on success, throws
  `InvalidCredentialsException` on any failure.
- `RegisterUserUseCase` — checks for duplicate email, generates a
  stable `id` (`usr-<random>`), hashes the password, persists, and
  returns the new `User`.

Both produce the JWT indirectly through `JwtProvider`, called by the
controller (not the use case), so the domain stays
framework-agnostic.

### 2.3 Infrastructure

- `JwtProvider` (component) — same JJWT 0.12.x API as the gateway.
  Reads `jwt.secret` and `jwt.expiration-ms`.
- `BcryptPasswordEncoderAdapter` (component) — implements the
  domain `PasswordEncoderService` using `BCryptPasswordEncoder`.
- `SecurityConfig` — disables Spring Security defaults (form login,
  HTTP Basic) and permits all on `/api/v1/auth/**`. This is
  intentionally permissive because the gateway is the real security
  perimeter; auth-service trusts upstream traffic.
- `UserEntity` (`@Entity`, `@Table(name="users", schema="auth")`)
  with the columns defined in `spec.md`.
- `UserJpaRepository extends JpaRepository<UserEntity, String>` with
  `Optional<UserEntity> findByEmail(String)`.

### 2.4 Adapters

- `AuthController` — exposes the two endpoints, depends only on
  the use cases + `JwtProvider`.
- DTOs use Bean Validation annotations
  (`@Email`, `@NotBlank`, `@Size`, etc.) and the controller's
  `@Valid` triggers `400` on failure.

## 3. Error handling

A small `@ControllerAdvice` (`ApiExceptionHandler`) maps domain and
validation exceptions to the JSON shape defined in the spec. This
keeps controllers free of try/catch.

## 4. Configuration

`application.yml` declares three profiles:

- `default` — uses an in-memory H2 for local dev (no Docker).
- `docker` — uses the `auth` schema on the Postgres container.
- `test` — uses H2 + ephemeral JWT secret for `mvn test`.

## 5. Database migration

For this change we let JPA `ddl-auto=update` create the `users`
table on first boot. A future change will introduce Flyway for
versioned migrations (cross-cutting concern, not auth-specific).

## 6. Open questions / follow-ups

| Question                                                       | Owner           | Tracked in           |
|----------------------------------------------------------------|-----------------|----------------------|
| Add Flyway for schema migrations                               | Platform Eng.   | Future change        |
| Add Testcontainers integration tests                           | Platform Eng.   | Future change        |
| Add refresh-token endpoint                                     | Platform Eng.   | Future change        |
| Add account lockout after N failed logins                      | Security        | Future change        |
