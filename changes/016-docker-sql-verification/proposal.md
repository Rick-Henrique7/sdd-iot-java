# Proposal — Docker & SQL verification for `field-operation-service`

## Why

A especificação do `field-operation-service` (ver
`docs/backend/microservices-specification/field-operation-service.md`) exige
que dois arquivos de infraestrutura do repositório sejam atualizados
**simultaneamente** ao merge do microsserviço:

1. **`docker-compose.yml`** — adicionar o novo serviço
   `field-operation-service` na porta `8085`, com as variáveis de ambiente
   de Kafka e PostgreSQL (schema `operations`), e referenciá-lo na lista de
   `depends_on` do `api-gateway`.
2. **`init.sql`** — adicionar o schema `operations` na lista de
   `CREATE SCHEMA IF NOT EXISTS`, executado automaticamente pelo
   `postgres:15-alpine` no primeiro boot.

Esta change garante que ambos os arquivos são revisados, commitados e
validados **antes** do PR de feature ser mergeado em `main`, evitando que
a stack suba quebrada.

## What changes

Nada de código de aplicação. Esta é uma change de **verificação
documentada** que acompanha o merge do `field-operation-service`. As
atualizações reais em `docker-compose.yml` e `init.sql` pertencem ao PR
do microsserviço.

O entregável desta change é o **checklist de duas ondas** descrito em
`tasks.md`, que deve ser executado:

- **Onda A (pré-merge)**: 5 min, no PR do `field-operation-service` antes
  de aprovar.
- **Onda B (pós-merge)**: 15 min, na PR de maintenance que também vai
  consolidar 014 (README update) e 015 (README update de UI/UX).

## Out of scope

- Modificações em `docker-compose.yml` ou `init.sql` (pertencem ao PR de
  feature do `field-operation-service`).
- Modificações em `docs/` (já cobertas pela change 014 e 015).

## Trigger

Esta change deve ser executada **em conjunto com a PR do
`field-operation-service`**, em duas ondas (pré e pós-merge).
