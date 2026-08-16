# Proposal — Field Operation Service

## Why

Hoje a plataforma Agro-IoT possui **5 microsserviços de backend** que cobrem telemetria, alertas, frota, autenticação e o simulador IoT. Falta um serviço que represente o **lado humano-operacional** da operação agrícola:

- O gestor não tem como criar/atribuir Ordens de Serviço (O.S.) aos operadores.
- O operador não tem como registrar pausas (reabastecimento, manutenção, chuva, almoço) de forma estruturada.
- Não há um diário de bordo que amarre check-in do operador a um equipamento + talhão específico.
- O dashboard do gestor não tem visibilidade ao vivo de **paradas operacionais** (apenas alertas de telemetria).

A spec completa em `docs/backend/microservices-specification/field-operation-service.md` documenta o serviço. Esta change implementa essa spec.

## What changes

- Adiciona um **sexto microsserviço** Spring Boot 3.3.4 / Java 17 ao multi-module Maven, alinhado com os outros 5 (`auth`, `telemetry-ingestion`, `alert-processing`, `fleet-mapping`, `iot-simulator`).
- Persistência relacional: `WorkOrderEntity`, `DowntimeEntity` + JPA Repositories, schema `operations` no Postgres compartilhado.
- Mensageria: publica eventos em `agri.operations.events` (tópico novo) no Kafka.
- API REST:
  - `POST /api/v1/operations/downtime` — operador registra pausa
  - `PATCH /api/v1/operations/work-orders/{id}/status` — operador atualiza status da O.S.
- Roteamento no `api-gateway` para a porta `8085`.
- Atualiza `docker-compose.yml` com o novo serviço + `init.sql` com o schema `operations`.

## Out of scope

- UI do Operador (`/operator/workspace`) — pertence à Change 020.
- Sidebar 6-abas do Gestor com a aba "Operações" — pertence à Change 020.
- Página de gestão de O.S. no front-end — fica para Change 021 (backlog).

## Acceptance criteria

- 5 testes JUnit verdes (mínimo: 1 entity test, 2 use case tests, 2 controller integration tests).
- `.\mvnw.cmd -B -pl field-operation-service -am test` retorna 5/5 verde.
- `docker compose up -d` sobe `agrio-field-operation` na porta 8085 com `/actuator/health` retornando `{"status":"UP"}`.
- `POST /api/v1/operations/downtime` via gateway (porta 8080) retorna 201 com JWT válido.
- `PATCH /api/v1/operations/work-orders/{id}/status` via gateway retorna 200.
- Tópico Kafka `agri.operations.events` é criado após o primeiro publish.
- Schema `operations` no Postgres é criado pelo `init.sql` no primeiro boot.

## Architecture

```
field-operation-service/
├── Dockerfile                       (multi-stage, mirror dos outros 5)
├── pom.xml                          (Spring Boot 3.3.4, Java 17, JPA, Kafka)
└── src/
    ├── main/
    │   ├── java/com/johndeere/agrio/operations/
    │   │   ├── FieldOperationApplication.java
    │   │   ├── domain/
    │   │   │   ├── model/
    │   │   │   │   ├── WorkOrder.java
    │   │   │   │   ├── WorkOrderStatus.java
    │   │   │   │   ├── DowntimeRecord.java
    │   │   │   │   └── DowntimeReason.java
    │   │   │   └── service/
    │   │   │       └── OperationDomainService.java
    │   │   ├── usecase/
    │   │   │   ├── CreateWorkOrderUseCase.java
    │   │   │   ├── RecordDowntimeUseCase.java
    │   │   │   └── UpdateWorkOrderStatusUseCase.java
    │   │   ├── infrastructure/
    │   │   │   ├── messaging/
    │   │   │   │   └── OperationEventPublisher.java
    │   │   │   └── persistence/
    │   │   │       ├── WorkOrderEntity.java
    │   │   │       ├── WorkOrderJpaRepository.java
    │   │   │       ├── DowntimeEntity.java
    │   │   │       └── DowntimeJpaRepository.java
    │   │   └── adapters/
    │   │       ├── controller/
    │   │       │   ├── WorkOrderController.java
    │   │       │   └── DowntimeController.java
    │   │       └── dto/
    │   │           ├── WorkOrderDTO.java
    │   │           ├── DowntimeDTO.java
    │   │           └── OperationEventDTO.java
    │   └── resources/
    │       └── application.yml
    └── test/
        └── java/com/johndeere/agrio/operations/
            ├── domain/model/WorkOrderTest.java
            ├── usecase/CreateWorkOrderUseCaseTest.java
            ├── usecase/RecordDowntimeUseCaseTest.java
            ├── adapters/controller/WorkOrderControllerIntegrationTest.java
            └── adapters/controller/DowntimeControllerIntegrationTest.java
```

## Trigger

Esta é a change que vai disparar a **execução do pacote de maintenance**:
- `changes/014-readme-update-for-new-services/tasks.md` (README update)
- `changes/016-docker-sql-verification/tasks.md` (Docker & SQL check, pré + pós-merge)
