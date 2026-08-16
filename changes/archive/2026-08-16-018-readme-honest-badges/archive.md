# Change 018 — README honest badges (archived 2026-08-16)

## Status

✅ **Shipped to `main` via PR #16** (squash-merge commit `82762bd1`).
✅ All 3 CI jobs green: `Validate SDD artifacts`, `Build & test (Maven)`,
`Build & test (frontend-shell)`.

## What changed

A linha 19 do `README.md` raiz continha um badge **Kubernetes** adicionado
de forma isolada via web UI do GitHub (commit `39f0230`), sem correspondência
com o `docker-compose.yml` que é o deploy real do projeto.

Esta change removeu o badge misleading e adicionou 4 badges que refletem
skills reais do código, além de retintar o badge Apache Kafka de preto
para marrom.

## Diff resumido (5 arquivos, 163+/2-)

### `README.md` (8 linhas alteradas)

**Removido:**

```markdown
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.29-blue?logo=kubernetes&logoColor=white)
```

**Adicionado (5 novos badges):**

```markdown
[![Maven](https://img.shields.io/badge/Maven-3.9.9-C71A36?logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-52%2F52%20tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![SDD](https://img.shields.io/badge/workflow-Spec--Driven-FFDE00)](./CONTRIBUTING.md)   <!-- readicionado após primeira edição -->
![Microservices](https://img.shields.io/badge/Microservices-6%20services-B71C1C)
```

**Modificado (cor do Apache Kafka):**

```diff
- [![Apache Kafka](...-231F20?logo=apachekafka...)]
+ [![Apache Kafka](...-8B4513?logo=apachekafka...)]
```

### SDD artifacts (`changes/018-readme-honest-badges/`)

- `proposal.md` — Por que tirar o Kubernetes, o que muda, fora de escopo.
- `spec.md` — Tabela de badges com URLs, cores, justificativas, ACs.
- `design.md` — Estratégia de edição cirúrgica, validação de URLs, diff planejado.
- `tasks.md` — 12 tasks numeradas, todas ✅ concluídas.

## Verification

| Check                         | Result                          |
| ----------------------------- | ------------------------------- |
| Badge URL pre-validation      | 6/6 HTTP 200                    |
| `npm test` (vitest)           | 52/52 across 11 test files      |
| `npm run build`               | 10/10 static pages              |
| `.\mvnw.cmd -B verify`        | 31/31 across 4 services         |
| CI `Validate SDD artifacts`   | ✅ success                      |
| CI `Build & test (Maven)`     | ✅ success                      |
| CI `Build & test (frontend-shell)` | ✅ success                  |

## Impact

- Zero impacto em código, testes, build, ou infra.
- Mudança puramente documental no `README.md`.
- O recruiter / technical reviewer que abrir o repositório agora vê
  badges alinhados com a stack real (Docker, Maven, TypeScript, Vitest,
  6 microservices) em vez de uma única referência falsa a Kubernetes.

## Related

- Change 017 — frontend polish + docs prep (PR #15).
- Change 012 — original README consolidation (PR #13).
- Commit `39f0230` — the source of the bad badge; this change cleans it up.
