# Spec — 022 work-orders list (022)

## Novos endpoints

### `GET /api/v1/operations/work-orders`

Query params (todos opcionais):
- `status` — filtra por status (`PENDING`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `CANCELLED`)
- `equipmentId` — filtra por equipamento
- `page` (default 0) — número da página
- `size` (default 50, max 200) — tamanho da página

Response 200:
```json
{
  "content": [
    {
      "id": "WO-uuid",
      "equipmentId": "TRAC-7230J-001",
      "operatorId": "user-uuid",
      "status": "PENDING",
      "notes": "Pulverização de precisão",
      "createdAt": "2026-08-16T20:00:00Z",
      "updatedAt": "2026-08-16T20:00:00Z"
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "page": 0,
  "size": 50
}
```

### `GET /api/v1/operations/work-orders/{id}`

Response 200 — objeto único igual ao item acima.
Response 404 — `{ "code": "WO_NOT_FOUND", "message": "..." }`

### `GET /api/v1/operations/downtime`

Query params (todos opcionais):
- `equipmentId` — filtra por equipamento
- `since` (ISO-8601) — só registros abertos a partir dessa data
- `page` (default 0)
- `size` (default 50, max 200)

Response 200: mesmo shape, content com `DowntimeDTO`.

## Use cases (backend)

```java
// usecase/ListWorkOrdersUseCase.java
public Page<WorkOrder> execute(WorkOrderFilter filter, Pageable pageable);

// usecase/GetWorkOrderByIdUseCase.java
public WorkOrder execute(String id);

// usecase/ListDowntimeRecordsUseCase.java
public Page<DowntimeRecord> execute(DowntimeFilter filter, Pageable pageable);
```

## Frontend

### `useWorkOrdersQuery(filters)`

```ts
export function useWorkOrdersQuery(filters?: { status?: string; equipmentId?: string }) {
  return useQuery({
    queryKey: ['work-orders', filters],
    queryFn: () => api.get<Page<WorkOrderDTO>>('/api/v1/operations/work-orders', { params: filters })
                .then(r => r.data),
    refetchInterval: 10_000,   // poll a cada 10s
  });
}
```

### `useDowntimeQuery(filters)`

Mesmo padrão.

### `/operations` page

Tabela com colunas: **ID** | **Equipamento** | **Status** (badge colorido) | **Criada em** (ISO curto) | **Operador**.

Empty state honesto: "Sem work-orders ativas. Crie uma via `/operator/workspace`."

### `/maintenance` page

Tabela com colunas: **Equipamento** | **Motivo** (label PT-BR) | **Iniciada em** | **Encerrada em** | **Duração** (calculada com `Clock.now()`).

Empty state: "Sem paradas registradas."

## Critérios de aceitação (gherkin)

- DADO que existe ao menos 1 WO no banco,
- QUANDO o Gestor acessa `/operations`,
- ENTÃO vê uma tabela com a WO listada.

- DADO que o Gestor filtra `?status=PENDING`,
- ENTÃO só vê WOs com esse status.

- DADO que chamo `GET /api/v1/operations/work-orders/inexistente`,
- ENTÃO recebo 404 com `code: WO_NOT_FOUND`.

- DADO que existe ao menos 1 downtime,
- QUANDO o Gestor acessa `/maintenance`,
- ENTÃO vê tabela com equipamento, motivo e duração calculada.
