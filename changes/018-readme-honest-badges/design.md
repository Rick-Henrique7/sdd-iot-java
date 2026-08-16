# Design — Honest README badges

## Estratégia

Edição **cirúrgica** no `README.md`, apenas nas linhas 10-19 (seção de badges).
Nenhuma outra seção do README é tocada. Mudança reversível com `git revert`
de um único commit.

## Diff planejado (trecho)

**Antes (linhas 10-19):**

```markdown
[![CI](https://img.shields.io/badge/CI-passing-367C2B)](./.github/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](./LICENSE)
[![Java](https://img.shields.io/badge/Java-17%20%2F%2021-ED8B00)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-24%2B-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-7.4-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SDD](https://img.shields.io/badge/workflow-Spec--Driven-FFDE00)](./CONTRIBUTING.md)
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.29-blue?logo=kubernetes&logoColor=white)
```

**Depois (linhas 10-19):**

```markdown
[![CI](https://img.shields.io/badge/CI-passing-367C2B)](./.github/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](./LICENSE)
[![Java](https://img.shields.io/badge/Java-17%20%2F%2021-ED8B00)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F)](https://spring.io/projects/spring-boot)
[![Maven](https://img.shields.io/badge/Maven-3.9.9-C71A36?logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-24%2B-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-7.4-8B4513?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Vitest-52%2F52%20tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Clean Architecture](https://img.shields.io/badge/Clean%20Architecture-domain%20isolated-FFDE00)](./CONTRIBUTING.md)
![Microservices](https://img.shields.io/badge/Microservices-6%20services-B71C1C)
```

## Validação de URLs (prévio ao commit)

Antes de commitar, cada URL de badge é validada via `curl` para garantir que
o shields.io resolve e retorna uma imagem PNG válida (HTTP 200). URLs que
retornarem 404 ou erro são ajustadas antes do push.

## Compatibilidade

Esta change **não** altera nenhum arquivo de código, configuração ou
infraestrutura. CI (3 jobs) deve passar sem ajustes, porque o `Validate SDD
artifacts` continua vendo os 4 artefatos em cada `changes/NNN-*` e os
testes Maven + Vitest não são afetados por mudança no README.
