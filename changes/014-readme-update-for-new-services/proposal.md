# Proposal — README update for new services

## Why

A change `012-readme-consolidation` reescreveu o `README.md` raiz documentando
**11 changes** e **5 microsserviços de backend** (`api-gateway`, `auth-service`,
`telemetry-ingestion-service`, `alert-processing-service`, `fleet-mapping-service`).

Com a chegada de novos microsserviços (a começar pelo `field-operation-service`,
definido em `docs/backend/microservices-specification/field-operation-service.md`),
o `README.md` precisará ser atualizado para refletir a nova realidade do stack.

## What changes

- Adicionar nova linha na tabela de Changes (seção 3) para cada novo microsserviço.
- Adicionar nova URL na matriz de serviços (seção 2 / Stack URLs) — porta `8085`
  para `field-operation-service`.
- Atualizar o diagrama ASCII de arquitetura (seção 4) com o novo container
  `agrio-field-operation-service` e o tópico Kafka `agri.operations.events`.
- Atualizar o "Repo layout" (seção 6) com a nova pasta `field-operation-service/`.
- Atualizar o `docs/` map (seção 5) referenciando
  `docs/backend/microservices-specification/field-operation-service.md`.
- Re-rodar `npm run build` + `mvnw.cmd test` para confirmar que o repo continua
  verde após o merge dos novos microsserviços.
- Mover esta pasta para `changes/archive/<data>-014-readme-update-for-new-services/`
  após o merge.

## Out of scope

- Mudanças de código em si. Esta é uma change puramente de documentação.
- Mudanças em `docker-compose.yml` ou `init.sql` (essas pertencem ao PR do
  `field-operation-service` em si, ou à task `016-docker-sql-verification`).

## Trigger

Esta change deve ser merged **somente após** o merge em `main` da change que
implementa o `field-operation-service`. Não commitar isoladamente.
