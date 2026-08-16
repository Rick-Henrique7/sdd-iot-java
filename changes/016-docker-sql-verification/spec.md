# Spec — Docker & SQL verification for `field-operation-service`

A especificação técnica detalhada do microsserviço que justifica esta
verificação está em:

- `docs/backend/microservices-specification/field-operation-service.md`

A configuração alvo (bloco YAML do `docker-compose.yml` e bloco SQL do
`init.sql`) está documentada em `tasks.md`, na seção "Configuração Alvo".

Esta change é **somente de verificação** e não modifica nenhum arquivo
de infraestrutura. As modificações reais em `docker-compose.yml` e
`init.sql` pertencem ao PR de feature do `field-operation-service`.

## Acceptance criteria

### Onda A (pré-merge)

O revisor do PR do `field-operation-service` deve conseguir responder "sim"
para todas as 6 verificações de A1 a A6 descritas em `tasks.md`:

- A1. O bloco `field-operation-service` está no `docker-compose.yml`.
- A2. O `init.sql` contém a linha `CREATE SCHEMA IF NOT EXISTS operations;`.
- A3. O `api-gateway` lista `field-operation-service` em `depends_on`.
- A4. O `field-operation-service/Dockerfile` existe e é multi-stage.
- A5. `docker compose config` passa sem erros de parse YAML.
- A6. O `pom.xml` raiz lista `field-operation-service` em `<modules>`.

### Onda B (pós-merge)

Após o merge, 9 verificações (B1 a B9) em `tasks.md` devem passar:

- B1. `docker compose up -d --build` sobe todos os containers.
- B2. `agrio-field-operation` aparece como `running`.
- B3. `curl http://localhost:8085/actuator/health` retorna `{"status":"UP"}`.
- B4. `psql -c '\dn'` lista o schema `operations`.
- B5. Tópico Kafka `agri.operations.events` é criado.
- B6. `POST /api/v1/operations/downtime` via gateway retorna 201.
- B7. `mvnw.cmd test` continua 45/45 verde.
- B8. `npm run build` continua 10/10 verde.
- B9. Esta pasta é movida para `changes/archive/`.
