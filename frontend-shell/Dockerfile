# ============================================================
#  frontend-shell — Next.js 14 multi-stage build
#
#  Stage 1 (builder): npm ci, `next build` (output: 'standalone')
#  Stage 2 (runner) : non-root `nextjs` user, copies the standalone
#                     server + .next/static + public/, exposes 3000.
# ============================================================

# -------- Stage 1: build --------
FROM node:20-alpine AS builder
WORKDIR /workspace/frontend-shell

# Optional: mirror npm config to avoid network surprises.
COPY frontend-shell/package.json frontend-shell/package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Build the app. next.config.mjs sets `output: 'standalone'` so the
# produced .next/standalone/ directory is a self-contained server.
COPY frontend-shell/next.config.mjs ./
COPY frontend-shell/tsconfig.json ./
COPY frontend-shell/tailwind.config.ts ./
COPY frontend-shell/postcss.config.mjs ./
COPY frontend-shell/src ./src
RUN npm run build

# -------- Stage 2: runtime --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create an unprivileged user (node:20-alpine already has `node`).
USER node

# Next's standalone output already includes a minimal node_modules
# tree, so we only need to add the static assets and the public dir.
COPY --chown=node:node --from=builder /workspace/frontend-shell/.next/standalone ./
COPY --chown=node:node --from=builder /workspace/frontend-shell/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
