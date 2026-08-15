# Agro-IoT Integrated Platform

> Spec-Driven Development (SDD) reference implementation of an enterprise agricultural IoT monitoring platform — event-driven microservices on Spring Boot 3 / Java 17, with a Next.js micro-frontend.

[![CI](https://img.shields.io/badge/CI-passing-367C2B)](./.github/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](./LICENSE)
[![Java](https://img.shields.io/badge/Java-17%20%2F%2021-ED8B00)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![SDD](https://img.shields.io/badge/workflow-Spec--Driven-FFDE00)](./CONTRIBUTING.md)

---

## 1. High-Level Architecture

```
+--------------------------------------------------------------------+
|                  NEXT.JS FRONT-END (SHELL APP)                     |
|        (Module Auth + Micro Front-ends / Operational Tabs)         |
+--------------------------------------------------------------------+
                                ^  (REST / WebSockets + JWT)
                                v
+--------------------------------------------------------------------+
|                       SPRING API GATEWAY                           |
+--------------------------------------------------------------------+
   |                  |                            |
   v                  v                            v
+--------+    +-------------------+    +-------------------+
| AUTH   |    | TELEMETRY INGEST  |    | FLEET & MAPPING   |
| SVC    |    | (Kafka Producer)  |    |  (Spring Data)    |
+--------+    +-------------------+    +-------------------+
   |                  |                            |
   v                  v                            v
+----------+   +----------------+   +-------------------+
| Postgres |   |  Kafka + Redis |   | Postgres + Redis   |
| (auth)   |   |  Cache         |   | (fleet)            |
+----------+   +----------------+   +-------------------+
                          |
                          v
                 +-------------------+
                 | ALERT PROCESSING  |
                 | (Kafka Consumer + |
                 |  WebSocket Push)  |
                 +-------------------+
```

## 2. Repository Layout

```
sdd-iot-java/
├── docs/                 # Specifications (single source of truth)
│   ├── general-vision/    # System overview
│   ├── backend/           # Backend specs + microservice specs
│   └── frontend/          # Next.js blueprints
├── changes/               # SDD change-management
│   ├── 001-api-gateway/   # Active change: proposal/spec/tasks/design
│   ├── 002-auth-service/  # Active change: proposal/spec/tasks/design
│   └── archive/           # Implemented changes archived by date
├── .github/               # GitHub-specific (workflows, templates)
├── api-gateway/           # Spring Cloud Gateway (WebFlux)
├── auth-service/          # JWT issuer
├── telemetry-ingestion-service/
├── alert-processing-service/
├── fleet-mapping-service/
├── iot-simulator-service/ # Node.js telemetry generator
├── k8s/                   # Kubernetes manifests
├── docker-compose.yml     # Local infrastructure
├── init.sql               # PostgreSQL isolated schemas
├── pom.xml                # Multi-module Maven parent
├── mvnw / mvnw.cmd        # Maven Wrapper
├── CONTRIBUTING.md        # How we work (SDD workflow)
└── LICENSE                # Apache 2.0
```

## 3. How we work — Spec-Driven Development (SDD)

This project follows a formal **Spec-Driven Development** model.
Every change goes through:

```
changes/NNN-short-name/
├── proposal.md   # Why this change? What problem?
├── spec.md       # Requirements delta (behavior, contracts, NFRs)
├── design.md     # Technical decisions & trade-offs
└── tasks.md      # Implementation checklist with acceptance criteria
```

Once a change is fully implemented and validated, it is moved to
`changes/archive/YYYY-MM-DD-NNN-short-name/`.

> See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for the full workflow,
> the branch naming convention, the PR template, and the review
> checklist.

## 4. Tech Stack

| Layer        | Technology                                                                |
|--------------|---------------------------------------------------------------------------|
| Front-end    | Next.js 14 (React 18 + TS), Zustand, React Query, React Leaflet, MUI      |
| Edge         | Spring Cloud Gateway (WebFlux, Netty, Resilience4j)                        |
| Backend      | Spring Boot 3.3, Java 17, Clean Architecture, JUnit 5 + Testcontainers     |
| Messaging    | Apache Kafka 7.4 + Zookeeper                                              |
| Storage      | PostgreSQL 15 (schemas: `auth`, `fleet`, `telemetry`), Redis 7.0          |
| Realtime     | WebSocket STOMP / SockJS                                                  |
| IaC          | Docker Compose (local), Kubernetes manifests (prod)                       |
| CI           | GitHub Actions (`mvnw verify` + Docker image build + push to GHCR)        |

## 5. Quickstart

### Prerequisites
- Java 17+ (21 recommended)
- Docker + Docker Compose
- Node.js 20+ (for `iot-simulator-service` and the front-end)
- Maven Wrapper (`./mvnw.cmd`) — already in this repo

### Bring up the full stack locally

```powershell
# 1. Start infrastructure
docker compose up -d postgres redis zookeeper kafka

# 2. Build and run all backend modules
./mvnw.cmd -B verify
docker compose up -d auth-service api-gateway

# 3. Smoke test
curl http://localhost:8080/actuator/health
curl http://localhost:8083/actuator/health
```

### Run only one module's tests

```powershell
./mvnw.cmd -pl api-gateway -am test
./mvnw.cmd -pl auth-service -am test
```

## 6. Governance & Boundaries

Hard rules for AI code generators and human contributors alike
(see `docs/backend/guidelines-and-governance`):

- **No autonomous actuator commands** — the platform is *informational*
  and *predictive* only. Human-in-the-loop is mandatory.
- **DTO and Kafka contract immutability** — no field changes without
  spec approval.
- **Clean Architecture is inviolable** — `domain/` must not import
  Spring, JPA, or Kafka.
- **No unvetted dependencies** in `pom.xml` / `package.json`.
- **No emojis** and no pure `#000000` in the front-end. Use
  `lucide-react` icons and the Slate palette only.
- **Secrets via env / K8s secrets only**. Never hardcode.

## 7. Contributing

We welcome issues and PRs! Please read
**[CONTRIBUTING.md](./CONTRIBUTING.md)** first — every change must
go through the SDD workflow (proposal → spec → design → tasks → code
→ tests → archive).

## 8. License

Apache License 2.0 — see [LICENSE](./LICENSE).
