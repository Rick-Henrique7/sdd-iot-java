# Design — Docker & SQL verification for `field-operation-service`

## Estratégia de duas ondas

### Onda A (pré-merge) — checklist do revisor

Duração alvo: **5 minutos**. O revisor do PR do `field-operation-service`
executa uma verificação rápida de que os artefatos físicos estão presentes:

1. A1, A2, A3, A4: 4 verificações visuais no diff do PR.
2. A5: 1 comando `docker compose config` (sem `--quiet` para ver YAML expandido).
3. A6: 1 grep no `pom.xml` raiz.

Se qualquer item falhar, o revisor pede mudanças antes de aprovar.

### Onda B (pós-merge) — checklist do merger

Duração alvo: **15 minutos**. Após o merge em `main`, a pessoa que está
conduzindo a PR de maintenance (que também consolida 014 + 015) executa:

1. **B1–B3**: stack up + health check (3 comandos).
2. **B4**: validação do schema `operations` no Postgres (1 comando `psql`).
3. **B5**: validação do tópico Kafka (1 comando `kafka-topics` ou auto-create).
4. **B6**: smoke test do endpoint de downtime (1 `curl` autenticado).
5. **B7–B8**: re-rodar testes (Maven + frontend).
6. **B9**: arquivar a pasta `changes/016-docker-sql-verification/`.

## Relação com outras tasks placeholder

Esta change (016) forma um **pacote de maintenance** junto com:

- `changes/014-readme-update-for-new-services/` — atualizar README com
  `field-operation-service`.
- `changes/015-readme-update-for-frontend-role-expansion/` — atualizar README
  com `operator/workspace` e Sidebar 6-abas do Gestor.

**Sugestão:** quando as 3 features (backend `field-operation-service` +
frontend `operator/workspace` + expansão de Sidebar) estiverem merged em
`main`, abrir uma **única PR de maintenance** que executa 014 + 015 + 016
em um único commit / squash.

## Por que duas ondas?

Separar em pré-merge (rápido, pelo revisor) e pós-merge (mais demorado, pelo
merger) garante que:

1. O revisor não precisa subir o stack completo (economiza tempo no code review).
2. A validação de runtime (B1–B6) só roda quando o código já está em `main`,
   evitando validações em branches que podem mudar.
3. O merger pode aplicar a PR de maintenance imediatamente após o merge da
   feature, sem ter que esperar revisor.
