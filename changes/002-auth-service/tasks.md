# Tasks — Change 002: auth-service

> **Implementation checklist. Each task is small, testable, and ends with a verifiable artifact.**

Format: `[ ]` not started · `[~]` in progress · `[x]` done

---

## 1. SDD artifacts

- [x] `changes/002-auth-service/proposal.md`
- [x] `changes/002-auth-service/spec.md`
- [x] `changes/002-auth-service/design.md`
- [x] `changes/002-auth-service/tasks.md` (this file)

## 2. Build & module wiring

- [x] Add `<module>auth-service</module>` to the parent `pom.xml`.
- [x] `auth-service/pom.xml` with starters, jjwt, postgres, actuator.

## 3. Domain (no Spring / JPA / JJWT)

- [x] `domain/model/UserRole.java` — enum `OPERADOR`, `AGRONOMO`, `GESTOR`.
- [x] `domain/model/User.java` — POJO.
- [x] `domain/service/PasswordEncoderService.java` — interface.
- [x] `domain/exception/InvalidCredentialsException.java`.
- [x] `domain/exception/DuplicateEmailException.java`.

## 4. Use cases

- [x] `usecase/AuthenticateUserUseCase.java`.
- [x] `usecase/RegisterUserUseCase.java`.

## 5. Infrastructure

- [x] `infrastructure/config/SecurityConfig.java` — permitAll on `/api/v1/auth/**`.
- [x] `infrastructure/security/JwtProvider.java` — HS256, claims: sub, userId, roles.
- [x] `infrastructure/security/BcryptPasswordEncoderAdapter.java`.
- [x] `infrastructure/persistence/UserEntity.java` — `@Table(name="users", schema="auth")`.
- [x] `infrastructure/persistence/UserJpaRepository.java`.
- [x] `infrastructure/persistence/UserEntityMapper.java` — `UserEntity ↔ User` (domain).

## 6. Adapters

- [x] `adapters/dto/LoginRequestDTO.java`.
- [x] `adapters/dto/RegisterRequestDTO.java`.
- [x] `adapters/dto/UserSummaryDTO.java`.
- [x] `adapters/dto/AuthResponseDTO.java`.
- [x] `adapters/controller/AuthController.java`.
- [x] `adapters/controller/ApiExceptionHandler.java` — `@ControllerAdvice` for the spec error shape.

## 7. Configuration

- [x] `application.yml` (default profile, H2 local).
- [x] `application-docker.yml` (profile=docker, Postgres + auth schema).
- [x] `application-test.yml` (profile=test, H2 + ephemeral JWT secret).

## 8. Tests

- [x] `AuthenticateUserUseCaseTest` — unit, JUnit 5 + Mockito, 4 cases.
- [x] `RegisterUserUseCaseTest` — unit, JUnit 5 + Mockito, 3 cases.
- [x] `AuthControllerIntegrationTest` — `@WebMvcTest`, 4 cases.

## 9. Container

- [x] `Dockerfile` — multi-stage, non-root, JRE 17 alpine.

## 10. Docker compose

- [x] Uncomment the `auth-service` block in `docker-compose.yml`.
- [x] Add it to the `api-gateway`'s `depends_on` chain.

## 11. Validation

- [x] `.\mvnw.cmd -pl auth-service -am test` is green.
- [x] `docker compose build auth-service` succeeds.
- [x] `docker compose up -d auth-service` brings the service up healthy.
- [x] End-to-end: register → login → use the JWT against the running api-gateway.

## 12. Archive

- [ ] After all validation passes, move `changes/002-auth-service/` to
      `changes/archive/2026-08-15-002-auth-service/`.

---

## Acceptance checklist (final go/no-go)

- [ ] No code under `domain/` references Spring, JPA, or JJWT.
- [ ] No hardcoded secrets; only `JWT_SECRET` env var.
- [ ] All 11 tests pass.
- [ ] Docker image builds and runs as non-root.
- [ ] End-to-end JWT flow works against the running api-gateway.
