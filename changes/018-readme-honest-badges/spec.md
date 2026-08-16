# Spec — Honest README badges

## Badges a serem adicionados (linhas 10-19 do `README.md`)

| Badge                  | URL shields.io                                                                                  | Cor        | Justificativa                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------- |
| Maven                  | `https://img.shields.io/badge/Maven-3.9.9-C71A36?logo=apachemaven&logoColor=white`              | C71A36     | `pom.xml` aggregator + 6 módulos + `mvnw.cmd`  |
| TypeScript             | `https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white`            | 3178C6     | `frontend-shell` 100% TS                       |
| Vitest                 | `https://img.shields.io/badge/Vitest-52%2F52%20tests-6E9F18?logo=vitest&logoColor=white`         | 6E9F18     | 11 test files, 52/52 verde                     |
| Clean Architecture     | `https://img.shields.io/badge/Clean%20Architecture-domain%20isolated-FFDE00`                    | FFDE00     | `domain/` puro em cada microsserviço           |
| Microservices          | `https://img.shields.io/badge/Microservices-6%20services-B71C1C`                                | B71C1C     | 5 Spring Boot + 1 Node.js (iot-simulator)      |

## Mudança de cor

| Badge         | Cor atual (antes) | Cor nova (depois) |
| ------------- | ----------------- | ----------------- |
| Apache Kafka  | `231F20` (preto)  | `8B4513` (marrom) |

## Remoção

Linha 19 do `README.md` (atual):

```markdown
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.29-blue?logo=kubernetes&logoColor=white)
```

Será substituída pela linha do badge **Microservices** (vermelho).

## Acceptance criteria (verificáveis)

- [ ] Linha 19 não contém mais `Kubernetes`.
- [ ] Linha 19 contém `Microservices` com cor `B71C1C`.
- [ ] Linhas 10-19 contêm 13 badges (9 originais + 4 novos - 1 removido + 1 mantido = 13).
- [ ] O badge Apache Kafka usa `8B4513` (verificável via `curl` na URL).
- [ ] `npm run build` retorna exit code 0.
- [ ] `.\mvnw.cmd test` retorna 45/45 verde.
