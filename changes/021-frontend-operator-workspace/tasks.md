# Tasks — 021 Operator workspace + role-aware shell (021)

## A. SDD artifacts (this folder)
- [x] A1. `proposal.md` — Contexto, objetivo, entregas, métricas de aceite.
- [x] A2. `spec.md` — Route groups, Sidebar 6-abas, useRoleGuard, AuthForm, stubs.
- [x] A3. `design.md` — Decisões (route groups vs conditional layout), estrutura de arquivos, lógica do hook.
- [x] A4. `tasks.md` — Este arquivo.

## B. Route group restructure
- [ ] B1. Mover `app/(app)/` → `app/(gestor)/` (mantém o `(app)/layout.tsx` renomeado).
- [ ] B2. Atualizar imports em `app/(gestor)/layout.tsx` se necessário.
- [ ] B3. Verificar que `npm run build` continua 11/11 (move não muda URL).

## C. Sidebar 6-abas
- [ ] C1. Expandir array `NAV` em `Sidebar.tsx` com 6 itens.
- [ ] C2. Adicionar `roles: UserRole[]` em cada `NavItem`.
- [ ] C3. Filtrar `NAV` por `user.role` antes de renderizar.
- [ ] C4. Importar ícones `ClipboardList` e `Wrench` de `lucide-react`.

## D. Routes registry
- [ ] D1. Adicionar `gestorOperations: '/operations'` e `gestorMaintenance: '/maintenance'` em `lib/routes.ts`.

## E. useRoleGuard hook
- [ ] E1. Criar `hooks/useRoleGuard.ts` com `landingPath` e `hasAccess`.
- [ ] E2. Teste vitest: 3 cenários (OPERADOR, AGRONOMO, GESTOR).

## F. AuthForm redirect
- [ ] F1. Substituir `router.push(routes.dashboard)` hardcoded por `useRoleGuard().landingPath(user.role)`.

## G. Stubs
- [ ] G1. `app/(gestor)/operations/page.tsx` — header + empty state.
- [ ] G2. `app/(gestor)/maintenance/page.tsx` — header + empty state.

## H. Validation
- [ ] H1. `npm run lint` — 0 errors.
- [ ] H2. `npm test` — 58/58 (57 atuais + 1 do `useRoleGuard`).
- [ ] H3. `npm run build` — 13/13 páginas.
- [ ] H4. Smoke test no browser: login como `ROLE_OPERADOR` cai em `/operator/workspace`; login como `ROLE_GESTOR` cai em `/dashboard` com 6 abas.

## I. README
- [ ] I1. §1.4 Personas: marcar "split físico implementado na Change 021".
- [ ] I2. §4 tabela: adicionar entrada 021.
- [ ] I3. §3 Tech stack: 13 páginas estáticas, 58 testes.

## J. PR
- [ ] J1. Commit + push.
- [ ] J2. PR via API.
- [ ] J3. Cron self para CI.
- [ ] J4. Após CI green: squash merge + archive + commit de archive.
