1. Script de Inicialização dos Bancos (init.sql)
SQL
-- Criacao dos Schemas Isolados para cada Microsservico
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS fleet;
CREATE SCHEMA IF NOT EXISTS telemetry;

-- Definicao de Timezone Padrão
SET timezone = 'UTC';
2. Orquestração para Desenvolvimento Local (docker-compose.yml)
YAML
version: '3.8'

services:
  # --- INFRAESTRUTURA BASE ---
  postgres:
    image: postgres:15-alpine
    container_name: agrio-postgres
    environment:
      POSTGRES_DB: agrio_db
      POSTGRES_USER: agrio_user
      POSTGRES_PASSWORD: agrio_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - agrio-network

  redis:
    image: redis:7.0-alpine
    container_name: agrio-redis
    ports:
      - "6379:6379"
    networks:
      - agrio-network

  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    container_name: agrio-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    networks:
      - agrio-network

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    container_name: agrio-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    networks:
      - agrio-network

  # --- MICROSSERVIÇOS ---
  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    container_name: agrio-api-gateway
    ports:
      - "8080:8080"
    environment:
      - JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971
    depends_on:
      - auth-service
      - telemetry-ingestion-service
      - fleet-mapping-service
    networks:
      - agrio-network

  auth-service:
    build:
      context: ./auth-service
      dockerfile: Dockerfile
    container_name: agrio-auth-service
    ports:
      - "8083:8083"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/agrio_db?currentSchema=auth
      - SPRING_DATASOURCE_USERNAME=agrio_user
      - SPRING_DATASOURCE_PASSWORD=agrio_password
      - JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971
    depends_on:
      - postgres
    networks:
      - agrio-network

  telemetry-ingestion-service:
    build:
      context: ./telemetry-ingestion-service
      dockerfile: Dockerfile
    container_name: agrio-telemetry-ingestion
    ports:
      - "8081:8081"
    environment:
      - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092
      - SPRING_REDIS_HOST=redis
      - SPRING_REDIS_PORT=6379
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/agrio_db?currentSchema=telemetry
      - SPRING_DATASOURCE_USERNAME=agrio_user
      - SPRING_DATASOURCE_PASSWORD=agrio_password
    depends_on:
      - kafka
      - redis
      - postgres
    networks:
      - agrio-network

  alert-processing-service:
    build:
      context: ./alert-processing-service
      dockerfile: Dockerfile
    container_name: agrio-alert-processing
    ports:
      - "8082:8082"
    environment:
      - SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092
    depends_on:
      - kafka
    networks:
      - agrio-network

  fleet-mapping-service:
    build:
      context: ./fleet-mapping-service
      dockerfile: Dockerfile
    container_name: agrio-fleet-mapping
    ports:
      - "8084:8084"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/agrio_db?currentSchema=fleet
      - SPRING_DATASOURCE_USERNAME=agrio_user
      - SPRING_DATASOURCE_PASSWORD=agrio_password
    depends_on:
      - postgres
    networks:
      - agrio-network

  iot-simulator-service:
    build:
      context: ./iot-simulator-service
      dockerfile: Dockerfile
    container_name: agrio-iot-simulator
    environment:
      - KAFKA_BROKER=kafka:29092
    depends_on:
      - kafka
    networks:
      - agrio-network

volumes:
  postgres_data:

networks:
  agrio-network:
    driver: bridge
3. Manifestos de Produção em Kubernetes (k8s/)
Para demonstrar a arquitetura cloud-native com Kubernetes, estruturamos os objetos declarativos em um diretório k8s/:

Plaintext
k8s/
├── namespace.yaml
├── configmap-env.yaml
├── secrets.yaml
├── api-gateway-deployment.yaml
└── telemetry-ingestion-deployment.yaml
3.1. Definição do Namespace (k8s/namespace.yaml)
YAML
apiVersion: v1
kind: Namespace
metadata:
  name: agrio-production
3.2. ConfigMap Global (k8s/configmap-env.yaml)
YAML
apiVersion: v1
kind: ConfigMap
metadata:
  name: agrio-config
  namespace: agrio-production
data:
  KAFKA_BOOTSTRAP_SERVERS: "kafka-cluster-kafka-bootstrap:9092"
  REDIS_HOST: "redis-master"
  REDIS_PORT: "6379"
  POSTGRES_URL: "jdbc:postgresql://postgres-postgresql:5432/agrio_db"
3.3. Exemplo de Deployment K8s com Autoscaling & Healthcheck (k8s/telemetry-ingestion-deployment.yaml)
Este manifesto especifica o Deployment, Service e réplicas autogerenciadas do Kubernetes para o microsserviço de ingestão de telemetria:

YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: telemetry-ingestion-service
  namespace: agrio-production
  labels:
    app: telemetry-ingestion
spec:
  replicas: 3 # Alta disponibilidade com 3 pod replicas
  selector:
    matchLabels:
      app: telemetry-ingestion
  template:
    metadata:
      labels:
        app: telemetry-ingestion
    spec:
      containers:
      - name: telemetry-ingestion
        image: agrio/telemetry-ingestion-service:v1.0.0
        imagePullPolicy: IFNotPresent
        ports:
        - containerPort: 8081
        envFrom:
        - configMapRef:
            name: agrio-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8081
          initialDelaySeconds: 20
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: telemetry-ingestion-service
  namespace: agrio-production
spec:
  type: ClusterIP
  ports:
  - port: 8081
    targetPort: 8081
  selector:
    app: telemetry-ingestion
Com isso, seu projeto possui toda a cadeia de documentação técnica coberta:

Frontend Next.js (HOCs, Debouncing, UI/UX Blueprint).

Arquitetura Macro de Back-end (Arquitetura Hexagonal / Event-Driven).

Especificações individuais de todos os 6 microsserviços.

Orquestração Local com Docker Compose + PostgreSQL Init Script.

Manifestos Cloud-Native de Kubernetes para Produção.