

Abaixo está o documento da **Visão Geral e Abrangente do Sistema**, contendo a arquitetura macro, o fluxo de dados unificado, o stack tecnológico completo e as integrações de alto nível.

---

```markdown
# Visão Geral do Sistema: Plataforma Agro-IoT Integrada

## 1. Contexto e Objetivos

Este documento especifica a visão macro, os objetivos estratégicos e a arquitetura global da **Plataforma Agro-IoT Integrada**. O sistema foi concebido para o monitoramento operacional em tempo real, telemetria de alta densidade e manutenção preditiva de frotas agrícolas.

A engenharia da solução é guiada pelo modelo **SDD (Spec-Driven Development)**, assegurando descentralização, baixo acoplamento entre camadas, Clean Code, testabilidade automatizada e aderência aos padrões corporativos enterprise.

---

## 2. Visão Macro da Arquitetura

O ecossistema é baseado em uma **Arquitetura Orientada a Eventos (Event-Driven Architecture)** combinada com **Microservices no Back-end** e **Micro Front-ends / Modularidade no Front-end**.

```text
+-----------------------------------------------------------------------+
|                      NEXT.JS FRONT-END (SHELL APP)                    |
|       (Módulo Auth + Micro Front-ends / Abas Operacionais)            |
+-----------------------------------------------------------------------+
                                   ^
                                   | (REST / WebSockets + JWT)
                                   v
+-----------------------------------------------------------------------+
|                         SPRING API GATEWAY                            |
+-----------------------------------------------------------------------+
        |                                |                        |
        v                                v                        v
+------------------+    +------------------+    +------------------+
|   AUTH SERVICE   |    | TELEMETRY INGEST |    | FLEET & MAPPING  |
| (Spring Security)|    | (Kafka Producer) |    |  (Spring Data)   |
+------------------+    +------------------+    +------------------+
        |                        |                        |
        v                        v                        v
+------------------+    +------------------+    +------------------+
|  POSTGRESQL DB   |    | APACHE KAFKA &   |    |  POSTGRESQL DB   |
|  (Usuários/JWT)  |    |   REDIS CACHE    |    |  + REDIS CACHE   |
+------------------+    +------------------+    +------------------+
                                 |
                                 v
                        +------------------+
                        | ALERT PROCESSING |
                        | (Kafka Consumer) |
                        +------------------+

```

---

## 3. Stack Tecnológico Unificado

### 3.1. Back-end & Ingestão

* **Linguagem / Framework Base:** Java 17 com Spring Boot.
* **Gateway & Roteamento:** Spring API Gateway.
* **Segurança:** Spring Security com autenticação e autorização via JWT.
* **Mensageria & Event Stream:** Apache Kafka (ingestão e propagação de telemetria).
* **Simulação IoT:** Serviço auxiliar em Node.js / Java para emissão de dados de sensores.

### 3.2. Banco de Dados & Armazenamento em Memória

* **Banco Relacional:** PostgreSQL (persistência de usuários, frotas, talhões e histórico).
* **Cache em Memória:** Redis (armazenamento do último estado da frota - *Latest State Cache*).

### 3.3. Front-end & Visualização

* **Core Framework:** Next.js (React 18 / TypeScript).
* **Gerenciamento de Estado:** Zustand (UI/WebSockets) + React Query (Cache REST).
* **Mapeamento:** React Leaflet + `leaflet.heat` (Heatmaps de pulverização/aplicação).
* **Dados Externos:** Open-Meteo API (dados meteorológicos em tempo real).

---

## 4. Fluxo de Dados End-to-End

1. **Autenticação de Usuário:** O operador/gestor autentica-se na tela de Login no Next.js. O `Auth Service` gera um token JWT que passa a ser injetado em todas as requisições subsequentes via interceptor.
2. **Ingestão de Telemetria:** O simulador de IoT publica pacotes contendo coordenadas, velocidade, RPM e temperatura do motor no Apache Kafka.
3. **Processamento Preditivo:** O `Alert Processing Service` consome as mensagens do Kafka. Ao detectar parâmetros fora do limite seguro (ex: temperatura > 95°C), gera uma notificação via WebSocket.
4. **Atualização da Interface:** O Next.js recebe o evento via WebSocket com *debouncing* para evitar re-renderizações excessivas e atualiza os dashboards e o mapa dinamicamente.

---

## 5. Orquestração da Infraestrutura (Docker)

A aplicação utiliza um ambiente totalmente containerizado:

* **Contêineres de Infraestrutura (`docker-compose.yml`):** PostgreSQL, Redis, Apache Kafka e Zookeeper.
* **Contêineres de Aplicação:** Build multi-stage para os microserviços Spring Boot e para a aplicação Next.js.

```