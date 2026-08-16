# Spec — 023 Maintenance package (023)

## 1. Pre-merge verification (from 016 tasks A1-A6)

### A1. docker-compose.yml
- Bloco `field-operation-service` presente com:
  - `container_name: agrio-field-operation`
  - `ports: ["8085:8085"]`
  - `SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092`
  - `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/agrio_db?currentSchema=operations`
  - `depends_on: [kafka, postgres]`
  - `networks: [agrio-network]`

### A2. init.sql
- `CREATE SCHEMA IF NOT EXISTS operations;` presente
- Tambem: `auth`, `fleet`, `telemetry`
- Role `agrio_operations` com grants (criado na Change 019)

### A3. api-gateway
- Lista `field-operation-service` em `depends_on`
- Rota `/api/v1/operations/**` -> `http://field-operation-service:8085`
- Filtro `JwtAuthenticationFilter` aplicado

### A4. field-operation-service/Dockerfile
- Multi-stage (eclipse-temurin:21-jdk-alpine builder + runtime)
- Expone porta 8085
- USER appuser (non-root)
- JAR entrypoint `java -jar /app/app.jar`

### A5. `docker compose config`
- Sem erros de parse YAML
- Sem warnings de variavel undefined

### A6. `pom.xml` raiz
- `<modules>` inclui `field-operation-service`
- `<dependencyManagement>` nao conflita

## 2. Pos-merge verification (from 016 tasks B1-B9)

### B1-B2. `docker compose up -d --build`
- 12 containers rodando: postgres, redis, zookeeper, kafka, api-gateway,
  auth-service, telemetry-ingestion-service, alert-processing-service,
  fleet-mapping-service, field-operation-service, frontend-shell,
  iot-simulator-service

### B3. Health endpoints
- `GET /actuator/health` retorna `{"status":"UP"}` em todas as 6 portas:
  8080 (gateway), 8081 (telemetry), 8082 (alert), 8083 (auth),
  8084 (fleet), 8085 (operations)

### B4. Postgres schemas
- `\dn` lista: auth, fleet, telemetry, **operations**
- Cada schema tem sua role dedicada

### B5. Kafka topics
- `agri.telemetry.raw`
- `agri.telemetry.processed`
- `agri.operations.events`

### B6. API gateway routing
- `POST /api/v1/auth/login` -> 200 (cria JWT)
- `GET /api/v1/fleet` -> 200 (lista equipamentos)
- `GET /api/v1/mapping/heatmaps?fieldId=FLD-01` -> 200
- `POST /api/v1/operations/downtime` -> 201 (autenticado)
- `GET /api/v1/operations/work-orders` -> 200 (autenticado)
- `GET /api/v1/operations/work-orders/{id}` -> 200/404
- `GET /api/v1/operations/downtime` -> 200

### B7-B8. Tests
- `mvnw.cmd -B verify` -> 58/58 verde
- `npm run build` -> 13/13 paginas estaticas

## 3. README consistency check (from 014 + 015)

- Subtitle: "Twenty-two SDD changes"
- Vitest badge: 67/67
- §3 Tech stack: 58 backend, 67 frontend
- §4 Change table: 22 entradas (001-013, 017, 018, 019, 020, 021, 022)
- §1.4 Personas: 2 roles (Operador, Gestor/Agronomo)
- §1.5 Design System: tokens + anti-padroes
- URL table: 7 URLs (login, register, dashboard, mapping, fleet, settings,
  operations, maintenance, operator/workspace)
- §8.1: 125 testes totais (58 backend + 67 frontend)

## 4. Criterios de aceitacao

- **DADO** que `docker compose up -d --build` roda na raiz,
- **QUANDO** o usuario espera ~30 segundos,
- **ENTAO** os 6 health endpoints retornam 200.

- **DADO** que `mvnw.cmd -B verify` roda,
- **ENTAO** 58/58 testes passam.

- **DADO** que `npm test` roda,
- **ENTAO** 67/67 testes passam.

- **DADO** que o usuario le o README raiz,
- **ENTAO** o numero de changes (22), contagem de testes (125), URL map
  (12 URLs + 8 endpoints backend), e arquitetura estao consistentes
  com o estado real do `main`.
