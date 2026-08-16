# Tasks — Verificação de Docker & SQL (`field-operation-service`)

> Task futura, **não** é uma change SDD completa de feature. É um **checklist
> de verificação** que precisa ser executado assim que o `field-operation-service`
> for merged em `main` e antes de subir o stack em ambiente de produção.
> ID reservado `016-docker-sql-verification` para manter a sequência numérica
> da pasta `changes/`.

## Contexto

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

Esta task garante que ambos os arquivos são revisados, commitados e validados
**antes** do PR de feature ser mergeado em `main`, evitando que a stack
suba quebrada.

---

## Configuração Alvo (referência)

### `docker-compose.yml` — bloco a ser adicionado

```yaml
  # --- NOVO MICROSSERVIÇO: OPERAÇÕES DE CAMPO ---
  field-operation-service:
    build:
      context: ./field-operation-service
      dockerfile: Dockerfile
    container_name: agrio-field-operation
    ports:
      - "8085:8085"
    environment:
      - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/agrio_db?currentSchema=operations
      - SPRING_DATASOURCE_USERNAME=agrio_user
      - SPRING_DATASOURCE_PASSWORD=agrio_password
    depends_on:
      - kafka
      - postgres
    networks:
      - agrio-network
```

E adicionar `field-operation-service` na lista `depends_on` do `api-gateway`.

### `init.sql` — linha a ser adicionada

```sql
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS fleet;
CREATE SCHEMA IF NOT EXISTS telemetry;
CREATE SCHEMA IF NOT EXISTS operations; -- NOVO SCHEMA

SET timezone = 'UTC';
```

---

## Tarefas

### A. Pré-merge (no PR de feature do `field-operation-service`)

- [ ] **A1. Confirmar** que o `docker-compose.yml` contém o bloco
      `field-operation-service` com `container_name: agrio-field-operation`,
      porta `8085`, `SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092` e
      `currentSchema=operations`.
- [ ] **A2. Confirmar** que o `init.sql` (no root do repo, montado em
      `/docker-entrypoint-initdb.d/init.sql`) contém a linha
      `CREATE SCHEMA IF NOT EXISTS operations;`.
- [ ] **A3. Confirmar** que o `api-gateway` lista `field-operation-service`
      em `depends_on`.
- [ ] **A4. Confirmar** que o `field-operation-service/Dockerfile` existe
      e é multi-stage (mirror do padrão dos outros 5 microsserviços).
- [ ] **A5. Rodar** `docker compose config` na raiz do repo — deve passar
      sem erros de parse YAML.
- [ ] **A6. Adicionar** o `field-operation-service` no `mvnw.cmd test -pl`
      smoke test (validar que o `pom.xml` está agregado ao `pom.xml` raiz
      no `<modules>`).

### B. Pós-merge (na PR de maintenance que consolida 014+015+016)

- [ ] **B1. Subir o stack** com `cmd /c "docker compose up -d --build"`
      (PowerShell stderr noise é esperado, conferir o `docker compose ps`
      em arquivo de log).
- [ ] **B2. Verificar** que `agrio-field-operation` aparece na lista
      `docker compose ps` com status `running` (ou `Up X seconds`).
- [ ] **B3. Verificar** o health endpoint
      `curl http://localhost:8085/actuator/health` retorna `{"status":"UP"}`.
- [ ] **B4. Verificar** o schema `operations` foi criado no Postgres:
      `cmd /c "docker exec agrio-postgres psql -U agrio_user -d agrio_db -c '\dn'"`
      deve listar `auth`, `fleet`, `telemetry` e **`operations`**.
- [ ] **B5. Verificar** o tópico Kafka `agri.operations.events` foi criado
      após o primeiro publish (ou criar manualmente via `kafka-topics` se
      `auto.create.topics.enable=false`).
- [ ] **B6. Verificar** que o `api-gateway` roteia
      `POST /api/v1/operations/downtime` → `field-operation-service:8085`
      com `curl -X POST http://localhost:8080/api/v1/operations/downtime`
      (autenticado via JWT, esperando `201 Created` com payload de
      `DowntimeDTO` válido).
- [ ] **B7. Re-rodar** `.\mvnw.cmd test` em todos os módulos — 45/45 deve
      permanecer verde.
- [ ] **B8. Re-rodar** `npm run build` no `frontend-shell` — todos os 10
      routes devem compilar.
- [ ] **B9. Mover esta pasta** para
      `changes/archive/<data>-016-docker-sql-verification/` após o merge.

---

## Trigger

Esta task deve ser executada **em duas ondas**:

- **Parte A** (pré-merge): checklist de **5 minutos** executado pelo
  revisor do PR do `field-operation-service` antes de aprovar.
- **Parte B** (pós-merge): checklist de **15 minutos** executado como
  parte da PR de maintenance que também vai consolidar 014 (README update
  para novos microsserviços) e 015 (README update para expansão de UI/UX).

---

## Relação com outras tasks placeholder

Esta task (016) forma um **pacote de maintenance** junto com:

- `changes/014-readme-update-for-new-services/tasks.md` — atualizar README
  com `field-operation-service`.
- `changes/015-readme-update-for-frontend-role-expansion/tasks.md` —
  atualizar README com `operator/workspace` e Sidebar 6-abas do Gestor.

**Sugestão:** quando as 3 features (backend `field-operation-service` +
frontend `operator/workspace` + expansão de Sidebar) estiverem merged em
`main`, abrir uma **única PR de maintenance** que executa 014 + 015 + 016
em um único commit / squash.
