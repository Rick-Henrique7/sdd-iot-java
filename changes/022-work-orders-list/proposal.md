# Proposal — 022 work-orders list (022)

## Contexto

`field-operation-service` (Change 019) só expõe escrita:
- `POST /api/v1/operations/work-orders` — criar WO
- `PATCH /api/v1/operations/work-orders/{id}/status` — atualizar status
- `POST /api/v1/operations/downtime` — registrar parada

Não tem **GET** de work-orders nem de downtime. Por isso, em Change 021,
a página `/operations` ficou como placeholder ("Sem work-orders ativas").

A página `/maintenance` também depende de dados do backend.

## Objetivo

Adicionar endpoints de leitura para popular `/operations` (lista de WO)
e `/maintenance` (lista de downtime com horímetro) no front.

## Entregas

1. `field-operation-service`:
   - `GET /api/v1/operations/work-orders` — lista todas as WO, ordenadas por `createdAt DESC`. Query params opcionais: `?status=PENDING|IN_PROGRESS|...&equipmentId=...`.
   - `GET /api/v1/operations/work-orders/{id}` — detalhe de uma WO.
   - `GET /api/v1/operations/downtime` — lista todas as paradas. Query param: `?equipmentId=...`.
   - Listar com paginacao simples (size + page) — backend retorna ate 50 por padrao.
2. Frontend:
   - `useWorkOrdersQuery()` (TanStack Query) e `useDowntimeQuery()`.
   - Substituir o empty state em `/operations` por uma tabela com 5 colunas (id, equipment, status, created, actions).
   - Substituir o empty state em `/maintenance` por uma tabela de downtime com horímetro e duração calculada.
3. Testes:
   - 1 teste unit novo no `WorkOrderJpaRepository` (query derivada).
   - 1 teste e2e novo no `WorkOrderControllerIntegrationTest` (GET 200 retorna lista).
4. README: badge de testes sobe, §3 menção, §4 linha nova.

## Não-objetivos

- Não implementa filtro por intervalo de datas.
- Não implementa WebSocket para push em tempo real (futuro).
- Não toca o domínio (zero mudança em `WorkOrder`, `DowntimeRecord`).

## Métricas de aceite

- `mvnw test -pl field-operation-service` — 13/13 (11 atuais + 2 novos).
- `mvnw -B verify` — 58/58 backend.
- `npm test` — 65/65 (63 atuais + 2 do `useWorkOrdersQuery` e `useDowntimeQuery`).
- `GET /api/v1/operations/work-orders` — 200, retorna lista de WOs.
- `GET /api/v1/operations/work-orders/{id}` — 200 ou 404.
- `/operations` no browser renderiza tabela (ou empty state honesto se DB vazio).
- `/maintenance` no browser renderiza tabela de downtimes.

## Dependências

- Change 019 (shipped) — schema `operations` + entities.
- Change 021 (shipped) — rota `/operations` e `/maintenance` ja existem.
