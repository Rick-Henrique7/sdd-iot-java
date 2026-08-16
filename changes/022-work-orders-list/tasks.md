# Tasks — 022 work-orders list (022)

- [x] A1. `proposal.md`
- [x] A2. `spec.md`
- [x] A3. `design.md`
- [x] A4. `tasks.md`

- [ ] B1. `WorkOrderJpaRepository`: `findAllByOrderByCreatedAtDesc(Pageable)`, `findByStatus`, `findByStatusAndEquipmentId`, `findById` (default)
- [ ] B2. `DowntimeJpaRepository`: `findAllByOrderByStartedAtDesc(Pageable)`, `findByEquipmentId`
- [ ] B3. `ListWorkOrdersUseCase` + `GetWorkOrderByIdUseCase`
- [ ] B4. `ListDowntimeRecordsUseCase`
- [ ] B5. `WorkOrderController` ganha `@GetMapping` e `@GetMapping("/{id}")`
- [ ] B6. `DowntimeController` ganha `@GetMapping`
- [ ] B7. `PageResponseDTO<T>` genérico
- [ ] B8. Teste unit repo + e2e controller (2 novos)
- [ ] C1. Front `useWorkOrdersQuery.ts` (TanStack Query, polling 10s)
- [ ] C2. Front `useDowntimeQuery.ts` (mesmo padrão)
- [ ] C3. `WorkOrdersTable.tsx` + teste
- [ ] C4. `DowntimeTable.tsx` + teste
- [ ] C5. `/operations` usa tabela (substitui placeholder)
- [ ] C6. `/maintenance` usa tabela (substitui placeholder)
- [ ] D1. `npm test` (65/65) + `mvnw -B verify` (58/58)
- [ ] D2. README: badge 65/65, §3, §4 entrada 022
- [ ] D3. Rebuild Docker frontend + smoke
- [ ] D4. PR via API + CI cron + merge + archive
