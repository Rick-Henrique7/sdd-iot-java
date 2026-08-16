# Spec — README update for new services

A especificação técnica detalhada do microsserviço que justifica esta change de
README está em:

- `docs/backend/microservices-specification/field-operation-service.md`

Esta change é **somente de documentação** e não introduz novos endpoints,
DTOs, microsserviços ou arquivos de infraestrutura. A spec completa do
microsserviço é a do documento referenciado acima.

## Acceptance criteria

- A tabela de Changes no `README.md` raiz lista o `field-operation-service`
  com a URL, a porta e a referência à spec em `docs/`.
- A matriz de URLs inclui `http://localhost:8085` mapeando para
  `field-operation-service`.
- O diagrama ASCII de arquitetura mostra o container `agrio-field-operation-service`
  conectado ao PostgreSQL (schema `operations`) e ao Kafka (tópico
  `agri.operations.events`).
- O "Repo layout" lista a pasta `field-operation-service/` ao lado das outras
  5 pastas de microsserviço já existentes.
- O `docs/` map referencia o novo spec em
  `docs/backend/microservices-specification/field-operation-service.md`.
- `npm run build` no `frontend-shell` continua verde.
- `.\mvnw.cmd test` em todos os módulos continua 45/45 verde.
- `docker compose config` continua parseando sem erros.
