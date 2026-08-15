```markdown
# Especificação Técnica: IoT Fleet Simulator (`iot-simulator-service`)

Este documento especifica o microsserviço auxiliar **IoT Fleet Simulator**, responsável pela geração sintética e transmissão contínua de pacotes de telemetria IoT simulados para o tópico do Apache Kafka na **Plataforma Agro-IoT Integrada**.

---

## 1. Escopo e Responsabilidades

* **Emissão Contínua de Telemetria Sintética:** Publicação de coordenadas GPS dinâmicas (percurso de campo), velocidade, rotação do motor (RPM) e temperatura de $n$ máquinas conectadas.
* **Injeção de Anomalias para Teste:** Capacidade de acionar comportamentos anômalos (ex: pico de temperatura $> 95^\circ\text{C}$ ou surto de RPM) para validar o disparo de alertas no `alert-processing-service`.
* **Integração com Apache Kafka:** Publicação assíncrona contínua diretamente no tópico `agri.telemetry.raw`.

---

## 2. Implementação do Gerador e Produtor (Node.js / TypeScript)

O simulador é construído com **Node.js + KafkaJS** para baixo consumo de recursos e alta concorrência baseada em timers e loops de eventos.

### Estrutura de Arquivos
```text
iot-simulator-service/
├── Dockerfile
├── package.json
├── tsconfig.json
└── src/
    ├── config/kafka.ts
    ├── generator/telemetryGenerator.ts
    └── index.ts

```

### Código Principal (`src/index.ts`)

```typescript
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'iot-simulator',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

const FLEET = [
  { id: 'TRAC-7230J-001', baseLat: -21.1704, baseLng: -47.8103 },
  { id: 'TRAC-7230J-002', baseLat: -21.1810, baseLng: -47.8210 },
  { id: 'COMB-S790-001', baseLat: -21.1920, baseLng: -47.8300 }
];

async function startSimulation() {
  await producer.connect();
  console.log('[IoT Simulator] Conectado ao Apache Kafka com sucesso.');

  setInterval(async () => {
    for (const machine of FLEET) {
      // Pequeno deslocamento aleatório das coordenadas de GPS
      machine.baseLat += (Math.random() - 0.5) * 0.0002;
      machine.baseLng += (Math.random() - 0.5) * 0.0002;

      // Injeção estocástica de anomalia (5% de chance de temperatura alta)
      const isAnomaly = Math.random() < 0.05;
      const engineTemp = isAnomaly ? 97.8 : 85.0 + Math.random() * 5;

      const payload = {
        equipmentId: machine.id,
        timestamp: new Date().toISOString(),
        gps: {
          latitude: machine.baseLat,
          longitude: machine.baseLng
        },
        metrics: {
          engineTemp: parseFloat(engineTemp.toFixed(1)),
          rpm: Math.floor(1800 + Math.random() * 400),
          fuelLevel: parseFloat((70 + Math.random() * 20).toFixed(1)),
          speed: parseFloat((12 + Math.random() * 4).toFixed(1))
        }
      };

      await producer.send({
        topic: 'agri.telemetry.raw',
        messages: [{ key: machine.id, value: JSON.stringify(payload) }]
      });
    }
  }, 1000); // Emissão a cada 1 segundo
}

startSimulation().catch(console.error);

```

---

## 3. Containerização Isolada (`Dockerfile`)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]

```

```

```