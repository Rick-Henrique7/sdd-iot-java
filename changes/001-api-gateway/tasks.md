# Tasks — Change 001: api-gateway

> **Implementation checklist. Each task is small, testable, and ends with a verifiable artifact.**

Format: `[ ]` not started · `[~]` in progress · `[x]` done

---

## 1. Scaffolding (repository root)

- [x] Create root `pom.xml` (parent, multi-module, Java 17, Spring Boot 3.3.4).
- [x] Create `.gitignore` (Maven, Node, IDE, secrets, OS junk).
- [x] Create `README.md` with the SDD workflow and architecture diagram.
- [x] Create `init.sql` with isolated schemas + restricted roles.
- [x] Create `docker-compose.yml` for the local stack.
- [x] Create `k8s/namespace.yaml`, `k8s/configmap-env.yaml`, `k8s/secrets.yaml`.
- [x] Create `k8s/api-gateway-deployment.yaml` (Deployment + Service + HPA).
- [x] Create `k8s/telemetry-ingestion-deployment.yaml`.

## 2. SDD Artifacts

- [x] `changes/001-api-gateway/proposal.md`
- [x] `changes/001-api-gateway/spec.md`
- [x] `changes/001-api-gateway/design.md`
- [x] `changes/001-api-gateway/tasks.md` (this file)

## 3. api-gateway module

- [x] `api-gateway/pom.xml` (depends on parent; gateway + jjwt + actuator + resilience4j + test deps).
- [x] `api-gateway/src/main/java/com/johndeere/agrio/gateway/ApiGatewayApplication.java`.
- [x] `api-gateway/src/main/java/com/johndeere/agrio/gateway/config/CorsConfig.java`.
- [x] `api-gateway/src/main/java/com/johndeere/agrio/gateway/config/SecurityConfig.java`.
- [x] `api-gateway/src/main/java/com/johndeere/agrio/gateway/filter/JwtAuthenticationFilter.java`.
- [x] `api-gateway/src/main/resources/application.yml` (routes + CORS + JWT secret + actuator).
- [x] `api-gateway/src/test/java/com/johndeere/agrio/gateway/ApiGatewayApplicationTests.java`.
- [x] `api-gateway/src/test/java/com/johndeere/agrio/gateway/filter/JwtAuthenticationFilterTest.java`.
- [x] `api-gateway/Dockerfile` (multi-stage, non-root, JRE 17 alpine).

## 4. Validation

- [x] `mvn -pl api-gateway -am clean package` builds the jar. **OK** — 39.83 MB fat jar.
- [x] `mvn -pl api-gateway test` runs the test suite. **OK** — 6/6 tests pass
  (`ApiGatewayApplicationTests`: 1/1 · `JwtAuthenticationFilterTest`: 5/5).
- [ ] Manually run the gateway and verify:

## 5. Documentation

- [x] README references this change.
- [x] `changes/001-api-gateway/` artifacts cross-link to `docs/backend/microservices-specification/api-gateway.md`.

## 6. Archive

- [ ] After all validation passes, move `changes/001-api-gateway/` to
      `changes/archive/2026-08-15-001-api-gateway/`.

---

## Acceptance Checklist (final go/no-go)

- [ ] No code under `domain/` references Spring, JPA, or Kafka.
- [ ] No hardcoded secrets; only `JWT_SECRET` env var.
- [ ] All filters in this change are wired through `application.yml`.
- [ ] All public routes (auth + actuator) are reachable without JWT.
- [ ] All non-public routes return `401` without JWT.
- [ ] `Dockerfile` builds successfully (`docker build api-gateway`).
- [ ] Test report attached to the change folder (`target/surefire-reports/`).
