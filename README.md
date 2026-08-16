# Agro-IoT Integrated Platform

> **Spec-Driven Development (SDD) reference implementation of an
> enterprise agricultural IoT monitoring platform** — event-driven
> microservices on Spring Boot 3.3.4 / Java 17, with a Next.js 14
> micro-frontend. Eleven SDD changes shipped end-to-end: six
> backend services, one IoT simulator, four frontend modules.

[![CI](https://img.shields.io/badge/CI-passing-367C2B)](./.github/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](./LICENSE)
[![Java](https://img.shields.io/badge/Java-17%20%2F%2021-ED8B00)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![SDD](https://img.shields.io/badge/workflow-Spec--Driven-FFDE00)](./CONTRIBUTING.md)

---

## 1. Acessar a aplicacao (localhost)

Com o stack Docker rodando, a plataforma fica disponivel nas
seguintes URLs (host = `localhost`):

| URL                                          | O que voce encontra                                                                 |
|----------------------------------------------|--------------------------------------------------------------------------------------|
| `http://localhost:3000/login`                | Tela de login (split-screen, dark mode).                                             |
| `http://localhost:3000/register`             | Tela de cadastro. Selecione `Operador` / `Agrônomo` / `Gestor`.                       |
| `http://localhost:3000/dashboard`            | KPIs ao vivo, grafico de telemetria, painel de alertas, tabela da frota.             |
| `http://localhost:3000/mapping`              | Mapa Leaflet com os trators, poligonos dos talhoes, heatmap, widget Open-Meteo.       |
| `http://localhost:3000/fleet`                | CRUD de equipamentos (cadastrar, listar, ativar/desativar).                          |
| `http://localhost:3000/settings`             | Perfil, thresholds de alerta, sessao, sobre.                                          |
| `http://localhost:8080/actuator/health`      | Health do API Gateway (proxy reverso, JWT na borda).                                  |
| `http://localhost:8081/actuator/health`      | Health do servico de ingestao de telemetria.                                         |
| `http://localhost:8082/actuator/health`      | Health do processador de alertas + endpoint STOMP `ws://localhost:8082/ws`.          |
| `http://localhost:8083/actuator/health`      | Health do servico de autenticacao.                                                   |
| `http://localhost:8084/actuator/health`      | Health do servico de frota + mapeamento (heatmap).                                   |
| `localhost:9092`                             | Broker Apache Kafka (topicos: `agri.telemetry.raw`, `agri.telemetry.processed`).     |
| `localhost:5432`                             | PostgreSQL 15 (schemas isolados: `auth`, `fleet`, `telemetry`, `alert`).             |
| `localhost:6379`                             | Redis 7 (cache de ultimo estado por equipamento).                                    |

### 1.1. Subir tudo (do zero)

```powershell
# 1. Subir o stack completo (infra + 6 servicos + 1 simulador + front)
cd C:\dev\projects\sdd-iot-java
docker compose up -d

# 2. Esperar ~30s ate os Spring Boots inicializarem e validar
3000  = (Invoke-WebRequest http://localhost:3000/login  -UseBasicParsing).StatusCode  # 200
8080  = (Invoke-WebRequest http://localhost:8080/actuator/health -UseBasicParsing).StatusCode  # 200
8081  = (Invoke-WebRequest http://localhost:8081/actuator/health -UseBasicParsing).StatusCode  # 200
8082  = (Invoke-WebRequest http://localhost:8082/actuator/health -UseBasicParsing).StatusCode  # 200
8083  = (Invoke-WebRequest http://localhost:8083/actuator/health -UseBasicParsing).StatusCode  # 200
8084  = (Invoke-WebRequest http://localhost:8084/actuator/health -UseBasicParsing).StatusCode  # 200
```

### 1.2. Derrubar tudo

```powershell
docker compose down            # Para containers, mantem volumes
docker compose down -v         # Para containers E apaga volumes (reset completo)
```

### 1.3. Credenciais de teste (ja cadastradas)

| Email                          | Senha      | Perfil        |
|--------------------------------|------------|---------------|
| `dash@agrio.io`                | `dash1234` | `ROLE_AGRONOMO` |

> A aplicacao tambem tem auto-cadastro: abra `http://localhost:3000/register`
> e crie sua propria conta escolhendo um dos tres perfis
> (`Operador` / `Agrônomo` / `Gestor`).

---

## 2. High-level architecture

```
+--------------------------------------------------------------------+
|                  NEXT.JS FRONT-END (SHELL APP)                     |
|        (Module Auth + 4 Modulos Operacionais: dashboard,           |
|         mapping, fleet, settings)                                  |
+--------------------------------------------------------------------+
                                ^  (REST /api/v1/* + WebSocket STOMP /ws + JWT)
                                v
+--------------------------------------------------------------------+
|            SPRING CLOUD GATEWAY (api-gateway :8080)                |
|        CORS centralizado + JwtAuthenticationFilter na borda        |
+--------------------------------------------------------------------+
   |                  |                            |
   v                  v                            v
+--------+    +-------------------+    +-------------------+
| AUTH   |    | TELEMETRY INGEST  |    | FLEET & MAPPING   |
| :8083  |    |      :8081        |    |       :8084       |
| (JWT)  |    | (Kafka Producer + |    | (CRUD frota +     |
|        |    |  Redis cache +    |    |  field-plot seed  |
|        |    |  Postgres hist)   |    |  + heatmap MVP)   |
+--------+    +-------------------+    +-------------------+
   |                  |                            |
   v                  v                            v
+----------+   +----------------+   +-------------------+
| Postgres |   |  Kafka + Redis |   | Postgres (schema  |
| (auth)   |   |  (cache        |   |  fleet)           |
+----------+   |   latest-state)|   +-------------------+
               +----------------+
                          |
                          v
                 +-------------------+        +----------------------+
                 | ALERT PROCESSING  | -----> |  STOMP /ws           |
                 |      :8082        |        |  /topic/alerts       |
                 | (Kafka Consumer + |        |  /topic/telemetry    |
                 |  WebSocket Push)  |        +----------------------+
                 +-------------------+
                          ^
                          |
                 +-------------------+
                 |  IoT SIMULATOR    |  (Node.js, 3 msg/s,
                 |                   |   5% de anomalia para
                 |                   |   exercitar o pipeline)
                 +-------------------+
```

Para o fluxo de dados detalhado e o racional arquitetural, veja
[`docs/general-vision/system-overview.md`](./docs/general-vision/system-overview.md).

---

## 3. Tech stack (atual, pos-Change 011)

| Camada        | Tecnologia                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| Front-end     | Next.js 14 (App Router, RSC), React 18, TypeScript, Tailwind CSS, Zustand, React Query, @stomp/stompjs    |
| Mapas         | react-leaflet 4 + leaflet 1.9 + leaflet.heat 0.2 (com dynamic ssr:false para isolar o bundle)             |
| Edge          | Spring Cloud Gateway (WebFlux + Netty), filtro JWT customizado, CORS centralizado                          |
| Backend       | Spring Boot 3.3.4, Java 17, Clean Architecture (domain sem Spring/JPA/Kafka), JUnit 5 + H2 + @EmbeddedKafka |
| Mensageria    | Apache Kafka 7.4 + Zookeeper 7.4, topicos `agri.telemetry.raw` e `agri.telemetry.processed`                 |
| Tempo real    | STOMP / WebSocket plain (sem SockJS) publicado pelo `alert-processing-service`                            |
| Storage       | PostgreSQL 15 (schemas isolados por bounded context: `auth`, `fleet`, `telemetry`, `alert`), Redis 7       |
| Auth          | JWT HS256 (JJWT), BCrypt, 3 perfis: `ROLE_OPERADOR` / `ROLE_AGRONOMO` / `ROLE_GESTOR`                     |
| Front-end dev | Vitest + @testing-library + happy-dom, ESLint (next/core-web-vitals)                                       |
| IaC           | Docker Compose (local), GitHub Actions (CI em `mvnw verify` + `npm test` + `npm run build`)               |
| Documentacao  | Mudancas estruturadas em `changes/NNN-name/{proposal,spec,design,tasks}.md`                               |

> Diferencas desta lista contra o `README.md` legado:
> - **Sem MUI** — Tailwind puro e componentes proprios.
> - **Sem SockJS** — WebSocket plain (browser acessa direto em `ws://localhost:8082/ws`).
> - **Sem Testcontainers** — testes de Kafka usam `@EmbeddedKafka` (broker in-process).
> - **Sem `lb://`** — o api-gateway aponta direto para `http://<service>:<porta>` em
>   docker (mais estavel para o resolver de servicos).

---

## 4. As 11 changes entregues

Cada change vive em `changes/NNN-short-name/` (proposta + spec + design + tasks).
Apos o merge, vai para `changes/archive/YYYY-MM-DD-NNN-short-name/`.

### Backend (Changes 001–006)

| #  | Change                                  | Status  | Resumo                                                                                                                                          |
|----|------------------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| 001| `api-gateway`                            | merged  | Edge unico, JWT na borda, CORS centralizado, Resilience4j reservado, 6 testes.                                                                  |
| 002| `auth-service`                           | merged  | Emissor de JWT HS256, BCrypt, 3 perfis (`ROLE_OPERADOR`/`ROLE_AGRONOMO`/`ROLE_GESTOR`), schemas `auth` isolados, 11 testes.                    |
| 003| `telemetry-ingestion-service`            | merged  | Consome `agri.telemetry.raw`, grava Redis latest-state + Postgres history, republica em `agri.telemetry.processed`, 6 testes.                  |
| 004| `alert-processing-service`               | merged  | Consome `agri.telemetry.processed`, avalia regras (engineTemp, rpm), persiste alertas, publica em `/topic/alerts` E `/topic/telemetry` (STOMP), 11 testes. |
| 005| `fleet-mapping-service`                  | merged  | CRUD de equipamentos, poligonos de talhoes (read), heatmap deterministico por `fieldId`, 12 testes.                                            |
| 006| `iot-simulator-service`                  | merged  | Node.js 20 + KafkaJS, 3 maquinas fake, 1Hz, 5% de anomalia, fecha o loop end-to-end.                                                            |

### Frontend (Changes 007–011)

| #  | Change                                  | Status  | Resumo                                                                                                                                            |
|----|------------------------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| 007| `frontend-shell`                         | merged  | Next.js 14, login/register, sidebar colapsavel, header, 5 placeholders, axios + JWT interceptor, withAuth HOC, 4 testes.                          |
| 008| `frontend-dashboard`                     | merged  | 3 KPIs ao vivo, grafico SVG de telemetria (60s de historico), painel de alertas, tabela de frota, debounce 1s no STOMP, 19 testes.               |
| 009| `frontend-mapping` + `frontend-fleet`    | merged  | Leaflet + heatmap, widget Open-Meteo, 3 talhoes seed, popover por trator, modal de cadastro, toggle de status, 30 testes.                         |
| 010| `frontend-settings`                      | merged  | `ProfileCard` (read-only), `ThresholdForm` (localStorage via `preferencesStore`), `SessionCard` (JWT countdown), `AboutCard`, 47 testes.         |
| 011| `frontend-role-enum-fix` (hotfix)        | merged  | Renomeia `UserRole` para o enum do backend (`ROLE_*`), expoe `ROLE_GESTOR` no select, novo helper `formatRole`, 52 testes.                       |

> O sistema ja nasce com **45 testes backend** (JUnit 5) + **52 testes frontend**
> (Vitest) verdes no CI, em 3 jobs: `Validate SDD artifacts`, `Build & test (Maven)`,
> `Build & test (frontend-shell)`.

### Mapa de URLs x mudanças

| URL                                | Backend que responde                  | Mudancas envolvidas |
|------------------------------------|----------------------------------------|----------------------|
| `POST /api/v1/auth/login`          | `auth-service:8083`                    | 001 + 002            |
| `POST /api/v1/auth/register`       | `auth-service:8083`                    | 001 + 002 + 011      |
| `GET  /api/v1/fleet`               | `fleet-mapping-service:8084`           | 001 + 005 + 009      |
| `POST /api/v1/fleet`               | `fleet-mapping-service:8084`           | 001 + 005 + 009      |
| `GET  /api/v1/mapping/heatmaps`    | `fleet-mapping-service:8084`           | 001 + 005 + 009      |
| `ws://localhost:8082/ws`           | `alert-processing-service:8082` (STOMP)| 001 + 004 + 008      |
| `http://localhost:3000/*`          | `frontend-shell` (Next.js)             | 007 + 008 + 009 + 010 + 011 |

---

## 5. Onde encontrar mais detalhes (documentacao por modulo)

A documentacao tecnica detalhada fica em [`docs/`](./docs). Use este mapa
para navegar:

### `docs/general-vision/`
- [`system-overview.md`](./docs/general-vision/system-overview.md) —
  visao macro, fluxo de dados end-to-end, stack unificado.

### `docs/backend/`
- [`backend-overview.md`](./docs/backend/backend-overview.md) — visao
  macro do back-end, papel do API Gateway, exemplos de `application.yml`
  e `Dockerfile`.
- [`orchestration.md`](./docs/backend/orchestration.md) — orquestracao
  do stack, sequencia de start, dependencias.
- [`microservices-specification/`](./docs/backend/microservices-specification) —
  contrato formal de cada servico:
  - `api-gateway.md`
  - `auth-service.md`
  - `telemetry-ingestion-service.md`
  - `alert-processing-service.md`
  - `fleet-mapping-service.md`
  - `iot-flet-simulator.md`
- [`guidelines-and-governance/`](./docs/backend/guidelines-and-governance) —
  regras inviolaveis: Clean Architecture, sem actuator autonomo, DTO
  imutavel, sem emojis, sem pretos puros, etc.

### `docs/frontend/`
- [`struct-frontend.md`](./docs/frontend/struct-frontend.md) — stack
  tecnologico, arquitetura de pastas, padroes HOC + debouncing,
  regras visuais anti-IA.
- [`blueprint.md`](./docs/frontend/blueprint.md) — blueprint visual
  (login split-screen, dashboard grid 3x4, mapping fullscreen,
  paleta de cores, tipografia, criterios de UX agricola).

### `changes/`
- 7 mudancas ativas em `changes/001-…` ate `changes/007-…` (proposal +
  spec + design + tasks).
- 4 mudancas arquivadas em `changes/archive/2026-08-15-008-…` ate
  `changes/archive/2026-08-15-011-…`.
- Cada `proposal.md` explica o **porque**; `spec.md` traz os
  requisitos; `design.md` detalha decisoes tecnicas; `tasks.md` lista
  o checklist de implementacao.

### `CONTRIBUTING.md`
- Workflow SDD completo: como abrir uma change, naming de branch
  (`NNN-name`), PR template, checklist de review, archive apos merge.

---

## 6. Repository layout

```
sdd-iot-java/
├── api-gateway/                          # Spring Cloud Gateway (WebFlux, JWT na borda)
├── auth-service/                         # Emissor de JWT (HS256) + BCrypt
├── telemetry-ingestion-service/          # Consome agri.telemetry.raw → Redis + Postgres + republica
├── alert-processing-service/             # Consome agri.telemetry.processed → alertas + STOMP /ws
├── fleet-mapping-service/                # CRUD frota + talhoes + heatmap deterministico
├── iot-simulator-service/                # Node.js 20 + KafkaJS, 3 maquinas, 1Hz, 5% anomalia
├── frontend-shell/                       # Next.js 14, modulos dashboard/mapping/fleet/settings
│
├── docs/                                 # Fonte de verdade das especificacoes
│   ├── general-vision/                   # Visao macro do sistema
│   ├── backend/                          # Specs + governance do back-end
│   │   ├── microservices-specification/  # Contrato de cada servico
│   │   └── guidelines-and-governance/    # Regras inviolaveis
│   └── frontend/                         # Blueprint + estrutura do front
│
├── changes/                              # SDD change-management
│   ├── 001-api-gateway/                  # proposal + spec + design + tasks
│   ├── 002-auth-service/
│   ├── 003-telemetry-ingestion-service/
│   ├── 004-alert-processing-service/
│   ├── 005-fleet-mapping-service/
│   ├── 006-iot-simulator-service/
│   ├── 007-frontend-shell/
│   └── archive/                          # Mudancas ja mergeadas
│       ├── 2026-08-15-008-frontend-dashboard/
│       ├── 2026-08-15-009-frontend-mapping/
│       ├── 2026-08-15-010-frontend-settings/
│       └── 2026-08-15-011-frontend-role-enum-fix/
│
├── .github/                              # Workflows, templates, CODEOWNERS
│   └── workflows/
│       └── ci.yml                        # 3 jobs: Validate SDD + Build & test (Maven) + Build & test (frontend-shell)
│
├── init.sql                              # Schemas isolados no Postgres (auth, fleet, telemetry, alert)
├── docker-compose.yml                    # Stack completo: infra + 6 servicos + simulador + front
├── pom.xml                               # Multi-module Maven parent
├── mvnw / mvnw.cmd                       # Maven Wrapper (3.9.9)
│
├── CONTRIBUTING.md                       # Workflow SDD + branch naming + PR template
├── LICENSE                               # Apache 2.0
└── README.md                             # Este arquivo
```

---

## 7. How we work — Spec-Driven Development (SDD)

Cada mudanca segue o pipeline:

```
changes/NNN-short-name/
├── proposal.md   # Por que? Que problema estamos resolvendo? Stakeholders?
├── spec.md       # Requisitos funcionais + nao-funcionais + criterios de aceitacao
├── design.md     # Decisoes tecnicas, trade-offs, alternativas consideradas
└── tasks.md      # Checklist de implementacao com [ ] / [x]
```

Fluxo canonico:

1. **Branch**: `NNN-short-name` (ex.: `012-heatmap-real-telemetry`).
2. **PR contra `main`** usando o template em `.github/PULL_REQUEST_TEMPLATE.md`.
3. **CI** roda os 3 jobs (Validate SDD + Maven + Frontend). PR sobe
   quando tudo estiver verde.
4. **Squash-merge** preserva um unico commit no `main`.
5. **Archive** movendo `changes/NNN-…/` para `changes/archive/AAAA-MM-DD-NNN-…/`.
6. **Deploy** da imagem correspondente (GHCR) no proximo push.

> Veja [`CONTRIBUTING.md`](./CONTRIBUTING.md) para o checklist completo,
> as politicas de revisao e o codigo de conduta.

---

## 8. Build & test local (sem Docker)

Use o **Maven Wrapper** para nao depender de uma instalacao local de Maven:

```powershell
# Back-end completo (todos os 6 servicos)
.\mvnw.cmd -B verify

# Modulo especifico + dependencias
.\mvnw.cmd -pl auth-service -am test
.\mvnw.cmd -pl alert-processing-service -am test

# Front-end
cd frontend-shell
npm ci
npm test          # 52/52 (Vitest)
npm run build     # 10 rotas, 87.7 KB shared
```

> O `mvnw.cmd` no Windows ja esta fixado para
> `https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip`
> (espelha o `settings.xml` corporativo, se houver).

---

## 9. Governance & boundaries (resumo)

Regras inviolaveis documentadas em
[`docs/backend/guidelines-and-governance/`](./docs/backend/guidelines-and-governance):

- **Sem actuator autonomo** — a plataforma e informativa e preditiva;
  toda acao operacional exige aprovacao humana.
- **Imutabilidade de DTO e contrato Kafka** — campos nao podem mudar
  sem atualizacao formal da spec e migration.
- **Clean Architecture** — `domain/` nunca importa Spring, JPA ou Kafka.
- **Sem dependencias nao-vetadas** em `pom.xml` / `package.json`.
- **Sem emojis** e **sem `#000000`** no front — usar `lucide-react`
  e a paleta Slate + John Deere Green (`#367C2B`).
- **Secrets via env / K8s secrets** — nunca hardcoded; `JWT_SECRET`
  e o unico segredo que a plataforma usa no dev local.
- **Trunk-based** — cada change vive numa branch de curta duracao
  e vai para `main` via squash-merge.

---

## 10. Contribuindo

Issues e PRs sao muito bem-vindos! Leia primeiro
[`CONTRIBUTING.md`](./CONTRIBUTING.md) — toda mudanca precisa passar
pelo workflow SDD (`proposal → spec → design → tasks → code → tests
→ archive`).

---

## 11. License

Apache License 2.0 — veja [`LICENSE`](./LICENSE).
