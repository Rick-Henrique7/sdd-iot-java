# Tasks — README update (follow-up dos novos microsserviços)

> Task futura, **não** é uma change SDD completa. Será executada como maintenance
> depois que os novos microsserviços forem merged em `main`. ID reservado
> `014-readme-update-for-new-services` para manter a sequência numérica da pasta
> `changes/`.

## Contexto

A change `012-readme-consolidation` reescreveu o `README.md` raiz documentando
**11 changes** e **5 microsserviços de backend**:

- `api-gateway`
- `auth-service`
- `telemetry-ingestion-service`
- `alert-processing-service`
- `fleet-mapping-service`

Com a chegada de novos microsserviços (a começar pelo `field-operation-service`),
o `README.md` precisará ser atualizado para refletir a nova realidade.

## Tarefas

- [ ] **1. Adicionar nova linha na tabela de Changes** (seção 3) para cada novo microsserviço
      (mínimo: `field-operation-service`).
- [ ] **2. Adicionar nova URL na matriz de serviços** (seção 2 / Stack URLs) — porta `8085`
      para `field-operation-service`.
- [ ] **3. Atualizar o diagrama ASCII de arquitetura** (seção 4) incluindo o novo container
      `agrio-field-operation-service` e o tópico Kafka `agri.operations.events`.
- [ ] **4. Atualizar o "Repo layout"** (seção 6) com a nova pasta `field-operation-service/`.
- [ ] **5. Adicionar badge / link do novo serviço na seção 1 (se aplicável)**.
- [ ] **6. Atualizar o `docs/` map** (seção 5) referenciando
      `docs/backend/microservices-specification/field-operation-service.md`.
- [ ] **7. Re-rodar `npm run build` + `mvnw.cmd test`** para confirmar que o repo continua
      verde após o merge dos novos microsserviços.
- [ ] **8. Rodar `docker compose up -d`** e validar os 5 health endpoints
      (`/actuator/health`) retornando 200.
- [ ] **9. Mover esta pasta para `changes/archive/<data>-014-readme-update-for-new-services/`**
      após o merge.

## Trigger

Esta task deve ser executada **somente após** o merge em `main` de:

- A change que implementar o `field-operation-service` (ou qualquer novo microsserviço
  previsto no roadmap).

Não commitar este `tasks.md` isoladamente — ele só vale como lembrete enquanto os
novos microsserviços ainda não estão em produção.
