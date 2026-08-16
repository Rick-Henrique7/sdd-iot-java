# Proposal — Honest README badges

## Why

O `README.md` raiz (linha 19) contém hoje um badge solto de **Kubernetes** que
**não corresponde à realidade do projeto**. O `sdd-iot-java` é deployado via
`docker-compose.yml` (11 containers), não via Kubernetes. Esse badge foi
adicionado diretamente pelo GitHub em commit avulso (`39f0230` "Add Kubernetes
badge to README") sem correspondência no código.

Manter o badge:

1. **Compromete credibilidade** — recrutador técnico abre o repo, vê o badge,
   procura `k8s/`, `helm/`, `deployment.yaml`, não encontra nada. Primeira
   impressão: "infla currículo".
2. **Desalinha com a stack real** — o projeto tem 5 microsserviços Spring Boot
   + 1 frontend Next.js + Postgres + Redis + Kafka, e os 9 badges já existentes
   (Java, Spring Boot, Next.js, Docker, Apache Kafka, PostgreSQL, CI, License,
   SDD) cobrem bem o que é real.
3. **Aparece solto** — sem nada antes/depois na linha, sinaliza adição
   improvisada.

## What changes

1. **Remover** a linha 19 do `README.md` (badge Kubernetes).
2. **Adicionar 4 badges** que refletem skills reais do projeto:
   - **Maven 3.9.9** — multi-module aggregator + `mvnw.cmd`.
   - **TypeScript 5.x** — frontend 100% TS com `tsconfig.json` estrito.
   - **Vitest 52/52 tests** — test runner real, 11 test files.
   - **Clean Architecture** — `domain/` puro em cada microsserviço Java.
3. **Adicionar 1 badge novo**:
   - **Microservices (vermelho)** — 6 serviços event-driven (5 Spring Boot + 1 Node).
4. **Mudar a cor do badge Apache Kafka** de preto (`231F20`) para marrom (`8B4513`).

## Out of scope

- Mudanças de código.
- Mudanças em `docker-compose.yml` ou specs.
- Refatoração maior do README (apenas os badges da linha 10-19).

## Acceptance criteria

- A linha 19 do `README.md` contém o badge **Microservices** (vermelho) em
  vez do Kubernetes.
- Os 4 badges novos (Maven, TypeScript, Vitest, Clean Architecture) estão
  presentes na seção de badges.
- O badge Apache Kafka usa a cor `8B4513` (marrom) em vez de `231F20` (preto).
- `npm run build` continua verde.
- `.\mvnw.cmd test` continua 45/45 verde.
- `docker compose config` continua parseando.
