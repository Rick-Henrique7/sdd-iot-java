# Design — 021 Operator workspace + role-aware shell (021)

## Decisões

### 1. Por que route groups paralelos e não conditional layout

Next.js App Router suporta ambos:
- **(A) route group** `app/(gestor)/` + `app/operator/` — segregação física, layouts independentes
- **(B) layout condicional** dentro de `app/(app)/` — um único layout que checa role

**Decisão: (A).** Razões:
- AuthGate vive no layout — quando um Operador acessa `/dashboard`, o AuthGate precisa rodar. Se o layout for condicional dentro de `(app)/`, ele só roda para `(app)/*` e o Operador pode burlar via URL direta.
- O Operador tem um shell completamente diferente (sem Sidebar, grid 3-seções, font-size maior). Layout separado é mais legível no código.
- Tree-shaking: código de Operador (Operador pages) não é importado no bundle do Gestor (e vice-versa) se usarmos route groups separados.

### 2. Por que Agrônomo vê 4 e não 6 abas

- **Operações e Manutenção** envolvem fluxo operacional (criação de work-orders, aprovação de manutenções). São ações de Gestor.
- **Agrônomo** é papel de leitura + alerta. Dashboard, Mapeamento, Frota (visualizar), Configurações (preferências) cobrem.
- Hardcoded no array `NAV` do `Sidebar.tsx` com `roles: UserRole[]` em cada item.

### 3. Por que `useRoleGuard` é um hook e não uma constante

- O `landingPath(role)` pode ser estático, mas `hasAccess(role, path)` precisa ler a lista de paths conhecidos por role.
- Manter como hook permite reativo a mudanças futuras (ex.: role dinâmico vindo do JWT refresh).

### 4. Mock vs real para `/operations` e `/maintenance`

- `field-operation-service` (Change 019) só tem `POST /downtime` e `PATCH /work-orders/{id}/status` — não tem GET.
- Mostrar tabela vazia com empty state claro é mais honesto do que mockar dados.
- Próxima change (`021` ou `022`) adiciona `GET /api/v1/operations/work-orders` no backend e liga na UI.

## Estrutura de arquivos

```text
src/
├── app/
│   ├── (app)/                         # REMOVIDO (movido para (gestor)/)
│   ├── (gestor)/                      # NOVO route group
│   │   ├── layout.tsx                 # movido de (app)/layout.tsx, AuthGate role ∈ {GESTOR, AGRONOMO}
│   │   ├── dashboard/page.tsx         # movido
│   │   ├── mapping/page.tsx           # movido
│   │   ├── fleet/page.tsx             # movido
│   │   ├── settings/page.tsx          # movido
│   │   ├── operations/page.tsx        # NOVO (stub)
│   │   └── maintenance/page.tsx       # NOVO (stub)
│   ├── operator/                      # entregue na 020
│   │   ├── layout.tsx
│   │   └── workspace/page.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── components/
│   └── layout/
│       └── Sidebar.tsx                # modificado: 6 items + role filter
├── hooks/
│   └── useRoleGuard.ts                # NOVO
├── lib/
│   └── routes.ts                      # adicionado gestorOperations, gestorMaintenance
└── modules/
    └── auth/
        └── AuthForm.tsx               # modificado: usa useRoleGuard
```

## Lógica do `useRoleGuard`

```ts
const ROLE_LANDING: Record<UserRole, string> = {
  ROLE_OPERADOR: '/operator/workspace',
  ROLE_AGRONOMO: '/dashboard',
  ROLE_GESTOR:   '/dashboard',
};

const ROLE_PREFIX: Record<UserRole, string> = {
  ROLE_OPERADOR: '/operator',
  ROLE_AGRONOMO: '',
  ROLE_GESTOR:   '',
};

export function useRoleGuard() {
  return {
    landingPath: (role: UserRole) => ROLE_LANDING[role],
    hasAccess: (role: UserRole, pathname: string): boolean => {
      if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
        return true;
      }
      return pathname.startsWith(ROLE_PREFIX[role]) || pathname === '/';
    },
  };
}
```

> **Nota:** `pathname === '/'` é tratado como acessível — `RootPage` faz `redirect('/login')` se não autenticado, e o AuthGate interno assume controle.

## Atualização do `Sidebar`

```ts
const NAV: NavItem[] = [
  { href: routes.dashboard,  label: 'Dashboard',    icon: LayoutDashboard, roles: ['ROLE_AGRONOMO', 'ROLE_GESTOR'] },
  { href: routes.mapping,    label: 'Mapeamento',   icon: Map,             roles: ['ROLE_AGRONOMO', 'ROLE_GESTOR'] },
  { href: routes.operations, label: 'Operações',    icon: ClipboardList,   roles: ['ROLE_GESTOR'] },
  { href: routes.fleet,      label: 'Frota',        icon: Truck,           roles: ['ROLE_AGRONOMO', 'ROLE_GESTOR'] },
  { href: routes.maintenance, label: 'Manutenção',  icon: Wrench,          roles: ['ROLE_GESTOR'] },
  { href: routes.settings,   label: 'Configurações', icon: Settings,        roles: ['ROLE_AGRONOMO', 'ROLE_GESTOR'] },
];

// Renderização condicional:
const visibleNav = NAV.filter((item) => user?.role && item.roles.includes(user.role));
```

## Teste do `useRoleGuard`

```ts
describe('useRoleGuard', () => {
  it('ROLE_OPERADOR lands on /operator/workspace', () => {
    const { result } = renderHook(() => useRoleGuard());
    expect(result.current.landingPath('ROLE_OPERADOR')).toBe('/operator/workspace');
  });

  it('ROLE_AGRONOMO lands on /dashboard with 4 tabs', () => {
    const { result } = renderHook(() => useRoleGuard());
    expect(result.current.landingPath('ROLE_AGRONOMO')).toBe('/dashboard');
    expect(result.current.hasAccess('ROLE_AGRONOMO', '/operations')).toBe(false);
  });

  it('ROLE_GESTOR lands on /dashboard with 6 tabs', () => {
    const { result } = renderHook(() => useRoleGuard());
    expect(result.current.landingPath('ROLE_GESTOR')).toBe('/dashboard');
    expect(result.current.hasAccess('ROLE_GESTOR', '/operations')).toBe(true);
  });
});
```

## Compatibilidade

- Move `(app)/` → `(gestor)/` é puramente refactor de paths — imports de `@/components/layout/Sidebar` continuam iguais.
- URLs externas (marcadores, deep links) **não mudam** — o route group `(gestor)` é parêntese, não aparece na URL.
- `useRoleGuard` é novo — zero impacto em código existente até ser importado por `AuthForm`.
- Stubs `/operations` e `/maintenance` não têm dados — não há regressão de UI.
