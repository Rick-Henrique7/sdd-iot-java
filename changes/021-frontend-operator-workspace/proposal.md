# Proposal — 021 Operator workspace + role-aware shell (021)

## Contexto

A Change 020 entregou o **Design System** e os **3 componentes do Operador** (OperatorHeader, OrderActionDock, DowntimeModal) + a rota dedicada `/operator/workspace`. O token JWT carrega `ROLE_OPERADOR` / `ROLE_AGRONOMO` / `ROLE_GESTOR`, mas a UI ainda trata todo mundo igual: o `Sidebar` tem 4 itens hardcoded, o `AuthForm` redireciona sempre pra `/dashboard` e não há segregação física das rotas.

O blueprint [`docs/frontend/operator-profile-and-gestor-sidebar.md`](../../docs/frontend/operator-profile-and-gestor-sidebar.md) já descreve o split — só falta implementar.

## Objetivo

Reorganizar `app/` em **dois route groups paralelos**:
- `(gestor)/` — shell com Sidebar 6-abas (Gestor + Agrônomo)
- `operator/` — workspace touch-friendly sem Sidebar (Operador)

E adicionar um **role-based redirect** pós-login.

## Entregas

1. Renomear `(app)/` → `(gestor)/` (route group paralelo).
2. Expandir `Sidebar` para **6 itens** (Dashboard, Mapeamento, Operações, Frota, Manutenção, Configurações), com filtro por role: `ROLE_OPERADOR` não vê Sidebar; `ROLE_GESTOR` e `ROLE_AGRONOMO` veem.
3. Adicionar 2 páginas stub: `/(gestor)/operations/page.tsx` e `/(gestor)/maintenance/page.tsx` (placeholders — Conteudo real vem em changes futuras).
4. Adicionar `hooks/useRoleGuard.ts` que recebe o role e retorna o path de destino pós-login.
5. Atualizar `AuthForm` pra chamar `useRoleGuard` e redirecionar.
6. Atualizar `lib/routes.ts` com `gestorOperations`, `gestorMaintenance` (e marcar `operatorWorkspace` como já feito).
7. Atualizar `lib/formatRole.ts` se precisar de variações (Operador / Agrônomo / Gestor).
8. Adicionar 1 teste vitest para `useRoleGuard` (3 cenários: operador, agrônomo, gestor).
9. README: §1.1 URL map (2 novas entradas); §1.4 Personas (marcar que a separação está implementada); §4 tabela de changes (entrada 021).
10. Manter `app/operator/workspace/page.tsx` como está (já entregue na 020).

## Não-objetivos

- Não pluga `useOperatorWorkspaceQuery` para O.S. real (backend `field-operation-service` ainda não tem GET; fica em change futura).
- Não adiciona tabela de work-orders na `/operations` (placeholder).
- Não implementa `/maintenance` com horímetro real (placeholder).

## Métricas de aceite

- `npm test` — 58/58 (57 atuais + 1 do `useRoleGuard`).
- `npm run build` — 13/13 páginas (11 atuais + `/(gestor)/operations` + `/(gestor)/maintenance`).
- `npm run lint` — 0 errors (regra `no-emoji` continua valendo).
- Login como `ROLE_OPERADOR` → aterrissa em `/operator/workspace` (não em `/dashboard`).
- Login como `ROLE_GESTOR` ou `ROLE_AGRONOMO` → aterrissa em `/dashboard` com Sidebar 6-abas.
- `/operator/workspace` continua acessível para `ROLE_OPERADOR` mesmo com Sidebar escondida.

## Dependências

- Change 020 (shipped) — fornece os 3 componentes Operator e a rota `/operator/workspace`.
- `field-operation-service` (Change 019) — o `DowntimeModal` consome o endpoint, mas não há GET de work-orders ainda (mock continua OK).
