# Tasks — 023 Maintenance package (023)

- [x] A1-A6. Spec + 4 SDD artifacts criados
- [x] B1. `mvnw -B verify` — 58/58 backend (Jenkinsfile roda isso)
- [x] B2. `npm test` — 67/67 frontend
- [x] B3. `npm run build` — 13/13 paginas

## 1. Pre-merge verification (016 A1-A6)
- [x] A1. `docker-compose.yml` tem `field-operation-service` na porta 8085 com `currentSchema=operations`
- [x] A2. `init.sql` tem `CREATE SCHEMA IF NOT EXISTS operations;`
- [x] A3. `api-gateway` lista `field-operation-service` em `depends_on` e tem a rota
- [x] A4. `field-operation-service/Dockerfile` existe (multi-stage, non-root, exp 8085)
- [x] A5. `docker compose config` — exit 0
- [x] A6. `pom.xml` raiz inclui `field-operation-service` no `<modules>`

## 2. README consistency (014 + 015)
- [x] Subtitle: "Twenty-two SDD changes"
- [x] Vitest badge: 67/67
- [x] §3 Tech stack: 58 backend, 67 frontend
- [x] §4 Change table: 22 entradas
- [x] §1.4 Personas: 2 roles
- [x] §1.5 Design System: tokens + anti-padroes
- [x] §8.1: 125 testes

## 3. Docker healthchecks (optional, bonus)
- [ ] Adicionar `healthcheck:` em `api-gateway`, `auth-service`, `telemetry-ingestion-service`, `alert-processing-service`, `fleet-mapping-service`, `field-operation-service`
- [ ] Adicionar `healthcheck:` em `frontend-shell`
- [ ] Rebuild + up + verificar `docker ps` mostra `(healthy)` em todos

## 4. Limpeza dos placeholders
- [ ] Mover `changes/014-...` para `archive/2026-08-16-014-readme-update-for-new-services/` (junto com seu tasks.md)
- [ ] Mover `changes/015-...` para `archive/...`
- [ ] Mover `changes/016-...` para `archive/...`

## 5. Validação
- [ ] `npm test` — 67/67
- [ ] `mvnw -B verify` — 58/58
- [ ] `npm run build` — 13/13
- [ ] PR via API
- [ ] Cron CI
- [ ] Merge squash + archive 023
