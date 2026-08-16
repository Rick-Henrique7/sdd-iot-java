# Spec — Field Operation Service

A especificação técnica detalhada do microsserviço está em
`docs/backend/microservices-specification/field-operation-service.md`.

Esta change é a **implementação** daquela spec.

## Endpoints REST

### `POST /api/v1/operations/downtime`

Registra uma pausa operacional.

**Request body (`DowntimeDTO`):**

```json
{
  "equipmentId": "TRAC-7230J-001",
  "operatorId": "OP-9942",
  "reason": "MAINTENANCE_REFUELING",
  "startTime": "2026-08-16T13:30:00Z",
  "comments": "Parada para reabastecimento de combustível e checagem de nível de óleo."
}
```

**Response:** `201 Created` com `DowntimeDTO` populado (incluindo `id` e `endTime=null`).

### `PATCH /api/v1/operations/work-orders/{id}/status`

Atualiza o status de uma Ordem de Serviço.

**Request body:**

```json
{
  "status": "IN_PROGRESS",
  "operatorNotes": "Iniciando pulverização na faixa norte do Talhão 01."
}
```

**Response:** `200 OK` com `WorkOrderDTO` atualizado.

## Kafka

- **Tópico:** `agri.operations.events`
- **Partições:** 1 (volume baixo de O.S. por dia)
- **Replication factor:** 1 (single-broker dev)
- **Key:** `equipmentId` (garante ordem por equipamento)
- **Payload:** `OperationEventDTO` com `eventType` ∈ {`WORK_ORDER_CREATED`, `WORK_ORDER_STATUS_CHANGED`, `DOWNTIME_RECORDED`, `DOWNTIME_ENDED`}

## Persistência

- **Schema:** `operations` (criado pelo `init.sql`)
- **Tabelas:**
  - `work_orders` (`id`, `equipment_id`, `field_id`, `operator_id`, `status`, `created_at`, `updated_at`, `operator_notes`)
  - `downtime_records` (`id`, `equipment_id`, `operator_id`, `reason`, `start_time`, `end_time`, `comments`)
- **Migrations:** Flyway (`db/migration/V1__create_operations_schema.sql`) — segue o padrão do `fleet-mapping-service`.

## Acceptance criteria (verificáveis)

- [ ] `.\mvnw.cmd -B -pl field-operation-service -am test` retorna 5/5 verde.
- [ ] `.\mvnw.cmd -B -pl field-operation-service -am package` gera o fat jar `field-operation-service-1.0.0-SNAPSHOT.jar`.
- [ ] `docker compose up -d` sobe o container `agrio-field-operation` na porta 8085.
- [ ] `curl http://localhost:8085/actuator/health` retorna `{"status":"UP"}`.
- [ ] `curl -X POST http://localhost:8080/api/v1/operations/downtime -H "Authorization: Bearer <JWT>" -d '{...}'` retorna 201.
- [ ] `psql -c '\dn'` lista o schema `operations`.
- [ ] CI `Validate SDD artifacts` continua verde.
- [ ] CI `Build & test (Maven)` continua 50/50 verde (era 45/45, +5 novos).
- [ ] CI `Build & test (frontend-shell)` continua 52/52 verde.
