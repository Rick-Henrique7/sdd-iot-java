# Design — 023 Maintenance package (023)

## Decisoes

### 1. Por que consolidar 014+015+016 em 1 PR

- Os 3 placeholders tocam o mesmo `README.md` (014 + 015) e o mesmo
  `docker-compose.yml` + `init.sql` (016). Tres PRs sequenciais seriam
  ruido de code review.
- Single PR = single CI run = single merge.
- O resultado e o mesmo: README + infra consistentes com `main`.

### 2. Por que 023 e nao 014+015+016 separados

- A sequencia numerica 014, 015, 016 ja foi usada (placeholders), mas
  esses placeholders NAO tem a estrutura de change real (4 SDD
  artifacts, branch, PR). A Change 023 e a change REAL que executa as
  tarefas dos 3 placeholders.
- Apos o merge, os 3 placeholders vao para `archive/` (junto com seus
  tasks.md originais), e a 023 vai para `archive/` com seus 4 SDD
  artifacts.

### 3. Por que healthchecks Docker (opcional)

- Antes: 4 infra (postgres/redis/kafka/zookeeper) tinham healthcheck.
  6 microsservicos + frontend NAO tinham, fazendo o `docker ps` mostrar
  `Up X minutes` sem a bolinha verde `(healthy)`.
- Adicionar healthcheck em todos simplifica o diagnostico visual no
  Docker Desktop e em scripts de CI.
- Apos: todos os 12 containers mostram `(healthy)` quando prontos.

### 4. Por que nao tocar em codigo de feature

- Maintenance package e 100% documentacao + infra.
- Qualquer mudanca funcional fica para changes dedicadas.
- Apos 022, o sistema esta 100% verde e completo para o escopo
  planejado. Manter maintenance focado em "verificacao + docs".

## Estrutura de arquivos

```text
changes/
├── 014-readme-update-for-new-services/        # placeholder (sera arquivado)
├── 015-readme-update-for-frontend-role-expansion/   # placeholder
├── 016-docker-sql-verification/              # placeholder
└── 023-maintenance-readme-docker-sql/         # NOVO (esta change)
    ├── proposal.md
    ├── spec.md
    ├── design.md
    └── tasks.md
```

## docker-compose.yml — healthcheck snippet

Para cada servico backend, adicionar:

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health || exit 1"]
  interval: 30s
  timeout: 5s
  retries: 5
  start_period: 60s
```

Trocar a porta em cada servico. Para o frontend (Next.js), usar
`wget -qO- http://localhost:3000/login || exit 1`.

## Verificacao local

```powershell
# 1. Unit tests
.\mvnw.cmd -B verify                    # 58/58
cd frontend-shell; npm test             # 67/67; cd ..

# 2. Lint + build
cd frontend-shell; npm run lint; npm run build; cd ..

# 3. Docker config
docker compose config --quiet           # exit 0

# 4. Stack UP
docker compose up -d --build
Start-Sleep 30

# 5. Health check
foreach ($p in @(8080,8081,8082,8083,8084,8085,3000)) {
  (Invoke-WebRequest "http://localhost:$p/actuator/health" -UseBasicParsing -TimeoutSec 5).StatusCode
}

# 6. Postgres schema check
docker exec agrio-postgres psql -U agrio_user -d agrio_db -c '\dn'
```

## Compatibilidade

- Adicionar healthcheck nao quebra nada: e puramente declarativo.
- Mudancas no README sao estritamente textuais.
- Nenhum impacto em performance, codigo de producao, ou schema de
  banco.
