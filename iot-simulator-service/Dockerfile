# ============================================================
#  iot-simulator-service — Node 20 multi-stage build
#
#  Stage 1 (builder): install dev deps, compile TS -> dist/
#  Stage 2 (runner) : production deps only, non-root, runs index.js
#
#  This Dockerfile assumes the docker build context is the
#  repository root (as the other services in this repo do), so
#  every COPY path is prefixed with `iot-simulator-service/`.
# ============================================================

# -------- Stage 1: build --------
FROM node:20-alpine AS builder
WORKDIR /workspace/iot-simulator-service

# Install ALL deps (including dev) so we can compile TypeScript.
COPY iot-simulator-service/package.json iot-simulator-service/package-lock.json* ./
RUN npm install --no-audit --no-fund

# Compile the sources to dist/.
COPY iot-simulator-service/tsconfig.json ./
COPY iot-simulator-service/src ./src
RUN npm run build

# Prune dev deps so the next stage can copy just the production
# node_modules without re-running npm install.
RUN npm prune --omit=dev

# -------- Stage 2: runtime --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Default broker for the docker-compose network. Override at
# `docker run` time with `-e KAFKA_BROKER=...` if needed.
ENV KAFKA_BROKER=kafka:29092
ENV KAFKA_TOPIC=agri.telemetry.raw
ENV SIM_INTERVAL_MS=1000

# Run as the unprivileged `node` user (UID 1000 in the base image).
USER node

COPY --chown=node:node iot-simulator-service/package.json iot-simulator-service/package-lock.json* ./
COPY --chown=node:node --from=builder /workspace/iot-simulator-service/node_modules ./node_modules
COPY --chown=node:node --from=builder /workspace/iot-simulator-service/dist ./dist

# No exposed ports — this is a producer, not a service.
CMD ["node", "dist/index.js"]
