# Spec — 021 Operator workspace + role-aware shell (021)

## Route groups

```
src/app/
├── (gestor)/                       # Shell com Sidebar 6-abas (Gestor + Agrônomo)
│   ├── layout.tsx                  # AppShell + TelemetryStreamMount + AuthGate role ∈ {GESTOR, AGRONOMO}
│   ├── dashboard/page.tsx
│   ├── mapping/page.tsx
│   ├── operations/page.tsx         # NOVO (stub)
│   ├── fleet/page.tsx
│   ├── maintenance/page.tsx        # NOVO (stub)
│   └── settings/page.tsx
├── operator/                       # Workspace dedicado (Operador) — entregue na 020
│   ├── layout.tsx                  # AuthGate role=ROLE_OPERADOR (sem Sidebar)
│   └── workspace/page.tsx
├── login/page.tsx
└── register/page.tsx
```

## Sidebar 6-abas (com filtro por role)

| # | href                    | Label                 | Ícone             | Roles permitidos                    |
|---|-------------------------|-----------------------|-------------------|--------------------------------------|
| 1 | `/dashboard`            | Dashboard             | `LayoutDashboard` | GESTOR, AGRONOMO                    |
| 2 | `/mapping`              | Mapeamento            | `Map`             | GESTOR, AGRONOMO                    |
| 3 | `/operations`           | Operações             | `ClipboardList`   | GESTOR                              |
| 4 | `/fleet`                | Frota                 | `Truck`           | GESTOR, AGRONOMO                    |
| 5 | `/maintenance`          | Manutenção Preditiva  | `Wrench`          | GESTOR                              |
| 6 | `/settings`             | Configurações         | `Settings`        | GESTOR, AGRONOMO                    |

> **REGRA AGRÔNOMO**: por padrão vê 1, 2, 4, 6. Operações e Manutenção são exclusivos do GESTOR (decisão de produto: agrônomo é consultor, não operador de sistema).

> **REGRA OPERADOR**: o componente `Sidebar` inteiro não renderiza (Operador vai pra `/operator/workspace` sem shell).

## useRoleGuard

```ts
// hooks/useRoleGuard.ts
export function useRoleGuard(): {
  landingPath: (role: UserRole) => string;
  hasAccess: (role: UserRole, pathname: string) => boolean;
}
```

- `landingPath('ROLE_OPERADOR')` → `/operator/workspace`
- `landingPath('ROLE_AGRONOMO')` → `/dashboard`
- `landingPath('ROLE_GESTOR')` → `/dashboard`
- `hasAccess(role, path)`:
  - `ROLE_OPERADOR` só pode acessar paths sob `/operator/**`
  - `ROLE_GESTOR` / `ROLE_AGRONOMO` só podem acessar paths sob `/(gestor)/**`
  - Caminhos públicos (`/login`, `/register`) são sempre acessíveis

## AuthForm

```ts
// Após login/register bem-sucedido:
const guard = useRoleGuard();
const target = guard.landingPath(user.role);
router.push(target);
```

## Stubs

### `/(gestor)/operations/page.tsx`
- Header "Operações" + descrição "Acompanhamento de Ordens de Serviço e Paradas."
- Empty state: "Sem work-orders ativas nesta janela. (backend GET em mudança futura)"

### `/(gestor)/maintenance/page.tsx`
- Header "Manutenção Preditiva" + descrição "Controle de horímetro e revisões por equipamento."
- Empty state: "Sem manutenções programadas."

## Contrato de aceitação

- **DADO** que faço login com `ROLE_OPERADOR`
- **QUANDO** autenticação retorna 200
- **ENTÃO** `router.push('/operator/workspace')` é chamado (não `/dashboard`)

- **DADO** que faço login com `ROLE_GESTOR`
- **QUANDO** autenticação retorna 200
- **ENTÃO** `router.push('/dashboard')` é chamado
- **E** a Sidebar renderiza 6 itens (Dashboard, Mapeamento, Operações, Frota, Manutenção, Configurações)

- **DADO** que faço login com `ROLE_AGRONOMO`
- **QUANDO** autenticação retorna 200
- **ENTÃO** `router.push('/dashboard')` é chamado
- **E** a Sidebar renderiza 4 itens (sem Operações nem Manutenção)

- **DADO** que `ROLE_OPERADOR` tenta acessar `/dashboard` via URL direta
- **ENTÃO** o AuthGate redireciona para `/operator/workspace`
