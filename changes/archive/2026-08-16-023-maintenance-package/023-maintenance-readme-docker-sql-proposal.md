# Proposal — 023 Maintenance package (023)

## Contexto

Apos Changes 019 (`field-operation-service`), 020 (Design System), 021
(role-aware shell) e 022 (work-orders list) merged em `main`, ficaram
3 placeholders: `014` (README do novo backend), `015` (README do
Perfil Operador + Sidebar), `016` (Docker & SQL verification do
`field-operation-service`). Os tres devem ser executados como um
**unico PR de maintenance** para evitar 3 PRs sequenciais tocando o
mesmo arquivo.

## Objetivo

Consolidar 014 + 015 + 016 em um unico PR de maintenance. Verificar
que toda a documentacao (README raiz + docs/) e a infra (Docker +
Postgres init.sql + Kafka topics + API gateway routes) estao consistentes
com o estado real do `main` apos 019-022.

## Entregas

1. **Verificacao pre-merge (016 A1-A6):** confirmar que
   - `docker-compose.yml` tem o bloco `field-operation-service` (porta 8085)
   - `init.sql` cria schema `operations`
   - `api-gateway` lista `field-operation-service` em `depends_on`
   - `field-operation-service/Dockerfile` existe (multi-stage)
   - `mvnw.cmd -B verify` roda todos os modulos (incluindo 019)
2. **Verificacao pos-merge (016 B1-B9):** stack Docker completo sobe
   com 12 containers, todos os 6 health endpoints retornam 200, schema
   `operations` no Postgres, topico `agri.operations.events` no Kafka.
3. **README final (014 + 015):** ja coberto pelas Changes 020-022 que
   atualizaram o README em cada merge. Verificar que nada ficou
   inconsistente (ex.: "21 changes" vs "22 changes", badge 57/57 vs
   67/67, etc.).
4. **Limpeza do live 014/015/016 folders** que ficaram no working
   tree apos archives de 020-022.
5. **Healthchecks Docker:** opcional, adicionar `healthcheck:` block
   nos 6 microsservicos backend + frontend no `docker-compose.yml`
   (antes so postgres/redis/kafka/zookeeper tinham).

## Nao-objetivos

- Nao cria features novas.
- Nao refatora codigo de producao.
- Nao mexe no backend.
- Nao mexe no frontend alem de README.

## Metricas de aceite

- `mvnw.cmd -B verify` — 58/58 backend
- `npm test` — 67/67 frontend
- `npm run build` — 13/13 paginas
- `docker compose config` — exit 0 sem warnings
- `docker compose ps` — todos os 12 containers `Up`
- 6/6 health endpoints retornam 200
- 1 PR de maintenance (squash) cobrindo as 3 tarefas

## Dependencias

- Changes 019, 020, 021, 022 (ja merged em main).
