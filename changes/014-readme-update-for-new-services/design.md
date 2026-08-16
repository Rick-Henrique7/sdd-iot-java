# Design — README update for new services

## Mudanças seção-por-seção do `README.md` raiz

### Seção 2 — Stack URLs

Adicionar uma nova linha na tabela de URLs:

```markdown
| `http://localhost:8085`     | `field-operation-service` (WorkOrder + Downtime) |
```

### Seção 3 — Tabela de Changes

Adicionar uma nova linha:

```markdown
| `<NNN>-field-operation-service` | `field-operation-service` | [`docs/backend/microservices-specification/field-operation-service.md`](docs/backend/microservices-specification/field-operation-service.md) |
```

(O número `NNN` será preenchido quando a change for aberta.)

### Seção 4 — Diagrama de arquitetura

Adicionar uma linha ASCII no diagrama existente:

```text
  agrio-field-operation    →  agrio-postgres (schema operations)
                          →  agrio-kafka     (topic agri.operations.events)
```

### Seção 5 — `docs/` map

Adicionar referência a `docs/backend/microservices-specification/field-operation-service.md`
na lista de microservices-specification.

### Seção 6 — Repo layout

Adicionar a entrada `field-operation-service/` ao lado das outras 5 pastas
de microsserviço.

## Estratégia de execução

Esta change é uma **única PR de maintenance** que também vai consolidar as
tasks placeholder 015 (README update para expansão de UI/UX) e 016 (Docker &
SQL verification). Espera-se que as 3 features subjacentes (backend
`field-operation-service` + frontend `operator/workspace` + expansão de Sidebar)
já estejam merged em `main` antes desta PR ser aberta.
