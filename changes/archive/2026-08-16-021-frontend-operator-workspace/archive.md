# Change 021 — frontend-operator-workspace (archived 2026-08-16)

## Status

✅ **Shipped to `main` via PR #19** (squash-merge commit `d0f683fb`).
✅ All 3 CI jobs green: `Validate SDD artifacts`, `Build & test (Maven)`,
`Build & test (frontend-shell)`.

## What was in the PR

PR #19 implemented the **role-aware shell** that physically splits
the routes into two parallel groups and redirects users by role after
login. Sucessor da Change 020 (Design System + 3 Operator components).

### 1 commit (squashed from `7fcf692`)

- Renomeação de `app/(app)/*` para `app/(gestor)/*` (URLs inalteradas)
- `(gestor)/layout.tsx` agora valida role e rejeita `ROLE_OPERADOR`
  (redireciona para `/operator/workspace`)
- `Sidebar.tsx` expandida para 6 abas com `roles: UserRole[]` por item
- `useRoleGuard.ts` (novo) com `landingPath(role)` e `hasAccess(role, path)`
- `AuthForm.tsx` usa `guard.landingPath(user.role)` no redirect pós-login
- 2 páginas stub novas: `(gestor)/operations` e `(gestor)/maintenance`
- `routes.ts` com `operations` e `maintenance`
- 6 testes vitest para `useRoleGuard`
- README atualizado (subtítulo 20→21, badge 57→63, §1.4 marca split
  implementado, tabela de changes com entrada 021)

**18 files changed (4 new, 14 modified including renames).**

## Route structure

```
src/app/
├── (gestor)/                  # rename from (app)/
│   ├── layout.tsx             # AuthGate role ∈ {GESTOR, AGRONOMO}
│   ├── dashboard/page.tsx
│   ├── mapping/page.tsx
│   ├── operations/page.tsx    # NEW (stub)
│   ├── fleet/page.tsx
│   ├── maintenance/page.tsx   # NEW (stub)
│   └── settings/page.tsx
├── operator/                  # entregue na 020, agora segregado
│   ├── layout.tsx             # AuthGate role=OPERADOR
│   └── workspace/page.tsx
├── login/page.tsx
└── register/page.tsx
```

## Sidebar 6-abas (com filtro por role)

| Role          | Abas visíveis                                                                 |
|---------------|--------------------------------------------------------------------------------|
| ROLE_OPERADOR | (nenhuma — workspace dedicado `/operator/workspace`)                         |
| ROLE_AGRONOMO | Dashboard, Mapeamento, Frota, Configurações (4)                              |
| ROLE_GESTOR   | + Operações, Manutenção (6)                                                   |

> Decisão: Operações e Manutenção são exclusivas do Gestor (papel
> de ação operacional). Agrônomo é papel de leitura/alerta.

## useRoleGuard

```ts
const ROLE_LANDING = {
  ROLE_OPERADOR: '/operator/workspace',
  ROLE_AGRONOMO: '/dashboard',
  ROLE_GESTOR:   '/dashboard',
};
```

- `landingPath(role)` — onde aterrissar após login/registro
- `hasAccess(role, pathname)` — confina Operador a `/operator/**`

## Verification

| Check                                       | Result                    |
| ------------------------------------------- | ------------------------- |
| `npm run lint`                              | 0 errors, 0 warnings      |
| `npm test` (vitest)                         | **63/63** across 13 files |
| `npm run build`                             | **13/13** static pages    |
| `docker compose build frontend-shell`       | image rebuilt             |
| `GET /operations` (live)                    | 200                       |
| `GET /maintenance` (live)                   | 200                       |
| CI `Validate SDD artifacts`                 | success                   |
| CI `Build & test (Maven)`                   | success (56/56)           |
| CI `Build & test (frontend-shell)`          | success                   |

## Test breakdown (new tests)

| Test class                       | Type      | Count |
| -------------------------------- | --------- | ----- |
| `useRoleGuard.test.ts`           | vitest    | 6     |
| **Total**                        |           | **6** |

## Related

- Blueprint: `docs/frontend/operator-profile-and-gestor-sidebar.md`
- Design System: `docs/frontend/design-system-and-interfaces.md`
- PR: #19
- Commit: `d0f683fb0ced26adbfcaa02c2f2b78b8af9b3aa1`
- Predecessor: Change 020 (design-system-and-interfaces)
- Successor: Change 022 (provável — `GET /api/v1/operations/work-orders`
  no `field-operation-service` para tirar `/operations` do placeholder)
