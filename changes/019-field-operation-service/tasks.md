# Tasks — Change 019 (field-operation-service)

## Fase 1 — Esqueleto Maven + Dockerfile (5 min)

- [ ] **1.1** Criar `field-operation-service/pom.xml` espelhando `fleet-mapping-service/pom.xml` (Spring Boot 3.3.4, Java 17, JPA, Kafka, MySQL driver → Postgres, Lombok).
- [ ] **1.2** Criar `field-operation-service/Dockerfile` multi-stage (mirror dos outros 5).
- [ ] **1.3** Adicionar `<module>field-operation-service</module>` no `pom.xml` raiz.
- [ ] **1.4** Rodar `.\mvnw.cmd -B -pl field-operation-service -am validate` — exit 0.

## Fase 2 — Domain + Use Cases (15 min)

- [ ] **2.1** Criar `domain/model/WorkOrder.java` (POJO puro, sem Spring).
- [ ] **2.2** Criar `domain/model/WorkOrderStatus.java` (enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED).
- [ ] **2.3** Criar `domain/model/DowntimeRecord.java` (POJO puro).
- [ ] **2.4** Criar `domain/model/DowntimeReason.java` (enum: REFUELING, MECHANICAL_BREAKDOWN, WEATHER_ADVERSE, MEAL_BREAK).
- [ ] **2.5** Criar `domain/service/OperationDomainService.java` (regras de transição de status, cálculo de duração).
- [ ] **2.6** Criar `usecase/CreateWorkOrderUseCase.java`.
- [ ] **2.7** Criar `usecase/RecordDowntimeUseCase.java`.
- [ ] **2.8** Criar `usecase/UpdateWorkOrderStatusUseCase.java`.

## Fase 3 — Infrastructure (10 min)

- [ ] **3.1** Criar `infrastructure/persistence/WorkOrderEntity.java` (JPA `@Entity`).
- [ ] **3.2** Criar `infrastructure/persistence/WorkOrderJpaRepository.java`.
- [ ] **3.3** Criar `infrastructure/persistence/DowntimeEntity.java`.
- [ ] **3.4** Criar `infrastructure/persistence/DowntimeJpaRepository.java`.
- [ ] **3.5** Criar `infrastructure/messaging/OperationEventPublisher.java` (Kafka template).
- [ ] **3.6** Criar `src/main/resources/application.yml` (perfil `default` apontando para Kafka + Postgres schema `operations`).
- [ ] **3.7** Criar `src/main/resources/application-test.yml` (H2 in-memory + Kafka desabilitado).
- [ ] **3.8** Criar `src/main/resources/db/migration/V1__create_operations_schema.sql` (Flyway).

## Fase 4 — Adapters REST (10 min)

- [ ] **4.1** Criar `adapters/dto/WorkOrderDTO.java` (record Java 17 com conversores `toDomain`/`fromDomain`).
- [ ] **4.2** Criar `adapters/dto/DowntimeDTO.java`.
- [ ] **4.3** Criar `adapters/dto/OperationEventDTO.java`.
- [ ] **4.4** Criar `adapters/controller/WorkOrderController.java` (`POST` + `PATCH`).
- [ ] **4.5** Criar `adapters/controller/DowntimeController.java` (`POST`).
- [ ] **4.6** Criar `FieldOperationApplication.java` (`@SpringBootApplication`).

## Fase 5 — Testes (15 min)

- [ ] **5.1** `domain/model/WorkOrderTest.java` — invariantes + transições de status.
- [ ] **5.2** `usecase/CreateWorkOrderUseCaseTest.java` — Mockito.
- [ ] **5.3** `usecase/RecordDowntimeUseCaseTest.java` — cálculo de duração.
- [ ] **5.4** `adapters/controller/WorkOrderControllerIntegrationTest.java` — `@SpringBootTest` + H2.
- [ ] **5.5** `adapters/controller/DowntimeControllerIntegrationTest.java` — `@SpringBootTest` + H2.
- [ ] **5.6** Rodar `.\mvnw.cmd -B -pl field-operation-service -am test` — 5/5 verde.

## Fase 6 — Docker + Init.sql (5 min)

- [ ] **6.1** Adicionar bloco `field-operation-service` no `docker-compose.yml`.
- [ ] **6.2** Adicionar `field-operation-service` em `depends_on` do `api-gateway`.
- [ ] **6.3** Adicionar `CREATE SCHEMA IF NOT EXISTS operations;` no `init.sql`.
- [ ] **6.4** Rodar `docker compose config` — sem erros de parse.

## Fase 7 — Gateway (5 min)

- [ ] **7.1** Adicionar rota `/api/v1/operations/**` → `field-operation-service:8085` no `api-gateway/src/main/resources/application.yml`.

## Fase 8 — Validação E2E local (10 min)

- [ ] **8.1** `cmd /c "docker compose up -d --build"` (stderr PowerShell esperado).
- [ ] **8.2** `curl http://localhost:8085/actuator/health` → `{"status":"UP"}`.
- [ ] **8.3** `curl http://localhost:8080/actuator/health` → `{"status":"UP"}` (gateway reconhece o novo serviço).
- [ ] **8.4** `curl -X POST http://localhost:8080/api/v1/operations/downtime -H "Authorization: Bearer <JWT>" -d '{...}'` → 201.
- [ ] **8.5** `curl -X PATCH http://localhost:8080/api/v1/operations/work-orders/{id}/status -H "Authorization: Bearer <JWT>" -d '{"status":"IN_PROGRESS"}'` → 200.
- [ ] **8.6** `cmd /c "docker exec agrio-kafka kafka-topics --list --bootstrap-server localhost:9092"` lista `agri.operations.events`.

## Fase 9 — Commit + PR + CI + Merge (10 min)

- [ ] **9.1** `git add field-operation-service/ pom.xml docker-compose.yml init.sql api-gateway/`
- [ ] **9.2** `git commit -m "feat(field-operation): add microservice for WorkOrder + Downtime"`
- [ ] **9.3** `git push -u origin 019-field-operation-service`
- [ ] **9.4** Abrir PR via API GitHub (`POST /repos/.../pulls`).
- [ ] **9.5** Armar cron self-reminder para monitorar CI.
- [ ] **9.6** Quando CI verde → squash merge → archive.
- [ ] **9.7** Mover `changes/019-field-operation-service/` → `changes/archive/2026-08-16-019-.../`.
- [ ] **9.8** Commit + push do archive.

## Trigger da maintenance pós-merge

Após o merge de Change 019, abrir Change 022 (ou sucessor) que executa:
- `changes/014-readme-update-for-new-services/tasks.md`
- `changes/016-docker-sql-verification/tasks.md` (parte B, pós-merge)
