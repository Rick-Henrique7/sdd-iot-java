# Design — 022 work-orders list (022)

## Decisões

### 1. Por que paginação simples (Pageable) e não cursor

- Plataforma ainda tem volume baixo (< 1k WOs esperadas).
- `Pageable` do Spring Data é o caminho de menor código.
- Migration futura para cursor é trivial via `Slice<>` se necessário.

### 2. Por que query derivada do JPA

- `WorkOrderJpaRepository extends JpaRepository<WorkOrderEntity, String>` — Spring Data gera queries a partir do nome do método.
- `findAllByOrderByCreatedAtDesc(Pageable)` — sem `@Query` custom.
- `findByStatus(WorkOrderStatus, Pageable)` — filtra direto.
- `findByEquipmentId(String, Pageable)` — idem.
- Combinar filtros: `findByStatusAndEquipmentId(...)`.

### 3. Por que polling 10s no front e não WebSocket

- `field-operation-service` ainda não publica eventos de mudança de WO no Kafka (apenas `OperationEventPublisher` na criação, em Change 019).
- Polling de 10s é suficiente para o CCO (Gestor não precisa de updates sub-segundo).
- Quando o backend tiver WS (Change futura), `useWorkOrdersQuery` muda pra WS e o resto da UI não precisa saber.

### 4. Por que `DowntimeRecord.durationAt(clock)` já existe

- Change 019 já adicionou `durationAt(Instant reference)` no domain (porque `duration()` usava `Instant.now()` direto e quebrava testes).
- Vou reaproveitar isso na coluna "Duração" do `/maintenance`.

## Estrutura de arquivos

```text
field-operation-service/
└── src/main/java/com/johndeere/agrio/operations/
    ├── usecase/
    │   ├── ListWorkOrdersUseCase.java            # NOVO
    │   ├── GetWorkOrderByIdUseCase.java         # NOVO
    │   └── ListDowntimeRecordsUseCase.java      # NOVO
    ├── adapters/
    │   ├── controller/
    │   │   ├── WorkOrderController.java          # +GET (list + byId)
    │   │   └── DowntimeController.java          # +GET list
    │   └── dto/
    │       ├── WorkOrderDTO.java                # (reuso; sem mudanças)
    │       ├── DowntimeDTO.java                 # (reuso)
    │       └── PageResponseDTO.java             # NOVO envelope genérico
    └── infrastructure/
        └── persistence/
            ├── WorkOrderJpaRepository.java      # +derived queries
            └── DowntimeJpaRepository.java       # +derived queries

frontend-shell/
└── src/
    ├── modules/operator/
    │   ├── useWorkOrdersQuery.ts                # NOVO
    │   └── useDowntimeQuery.ts                  # NOVO
    ├── modules/work-orders/                      # NOVO módulo
    │   ├── WorkOrdersTable.tsx                  # NOVO
    │   └── useWorkOrdersPage.ts                 # NOVO
    ├── modules/downtime/                         # NOVO módulo
    │   ├── DowntimeTable.tsx                    # NOVO
    │   └── useDowntimePage.ts                   # NOVO
    └── app/(gestor)/
        ├── operations/page.tsx                  # substitui placeholder
        └── maintenance/page.tsx                 # substitui placeholder
```

## Contrato `PageResponseDTO<T>`

```ts
export interface PageResponseDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
```

Backend usa `Page<T>` do Spring Data; controller mapeia pra esse DTO (sem expor `Pageable` cru).

## Compatibilidade

- POST/PATCH existentes não mudam.
- Adicionar métodos ao JPA repo é puramente aditivo.
- `WorkOrderDTO`/`DowntimeDTO` ficam inalterados (o GET usa o mesmo DTO que o POST).
- Front: as páginas `/operations` e `/maintenance` ganham conteúdo real; não há migração de dados.

## Plano de teste

- **Backend**:
  - `WorkOrderJpaRepositoryTest` (1 caso): `findAllByOrderByCreatedAtDesc` retorna ordenado.
  - `ListWorkOrdersUseCaseTest` (1 caso): filtro por status.
  - `WorkOrderControllerIntegrationTest` (1 caso novo): GET 200 com 0 WOs.
- **Frontend**:
  - `WorkOrdersTable.test.tsx` (1 caso): renderiza com 0 items (mostra empty state honesto).
  - `DowntimeTable.test.tsx` (1 caso): renderiza com 1 item (mostra duração formatada).
