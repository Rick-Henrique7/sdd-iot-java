# Design — README update for frontend role expansion

## Mudanças seção-por-seção do `README.md` raiz

### Seção 1 — Tech stack

Adicionar uma linha:

```markdown
- **Personas**: role-based routing via JWT (`ROLE_GESTOR` → `(gestor)/` shell,
  `ROLE_OPERADOR` → `/operator/workspace`).
```

### Seção 2 — Stack URLs

Adicionar:

```markdown
| `http://localhost:3000/operator/workspace` | Operator workspace (touch-friendly, no sidebar) |
```

### Seção 3 — Tabela de Changes

Adicionar uma nova linha para a change que implementa o `operator/workspace`
+ Sidebar 6-abas.

### Seção 4 — Diagrama de arquitetura

Atualizar o bloco do front-end para mostrar a bifurcação:

```text
  Frontend (Next.js 14, dev)
    ├── (gestor)/        →  dashboard, mapping, operations, fleet, maintenance, settings
    └── operator/        →  workspace (touch-friendly, sem sidebar)
```

### Seção 5 — `docs/` map

Adicionar referência a `docs/frontend/operator-profile-and-gestor-sidebar.md`.

### Seção 6 — Repo layout

Atualizar a árvore para mostrar:

```text
frontend-shell/src/app/
├── (gestor)/
│   ├── layout.tsx
│   ├── dashboard/
│   ├── mapping/
│   ├── operations/
│   ├── fleet/
│   ├── maintenance/
│   └── settings/
├── operator/
│   └── workspace/
├── login/
└── register/
```

### Seção 7 — Personas & Permissões (nova sub-seção)

```markdown
## Personas & Permissões

| Role             | Redirect após login   | Rotas acessíveis                          | UI shell                |
|------------------|-----------------------|-------------------------------------------|-------------------------|
| `ROLE_GESTOR`    | `/dashboard`          | `(gestor)/*`                              | Sidebar 6-abas          |
| `ROLE_OPERADOR`  | `/operator/workspace` | `/operator/workspace`                     | Top header, sem sidebar |
| `ROLE_AGRONOMO`  | `/dashboard`          | `(gestor)/*` (read-only em `operations`)  | Sidebar 6-abas          |
```

## Estratégia de execução

Esta change deve ser consolidada com 014 (README update para novos serviços)
e 016 (Docker & SQL verification) em uma única PR de maintenance. Espera-se
que as features subjacentes (frontend `operator/workspace` + backend
`field-operation-service`) já estejam merged em `main` antes da PR ser aberta.
