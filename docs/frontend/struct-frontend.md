Aqui está o arquivo Markdown exclusivo e dedicado ao **Front-end**, estruturado detalhadamente com a arquitetura Next.js, abordagens de otimização como *debouncing*, *HOCs (Higher-Order Components)*, estratégias de resiliência e diretrizes de design anti-padrão de IA.

---

```markdown
# Especificação Técnica do Front-end: Plataforma Agro-IoT Integrada

## 1. Stack Tecnológico & Bibliotecas

* **Core Framework:** Next.js (React 18 / TypeScript)
* **Gerenciamento de Estado:** Zustand (para estado local de UI/Sockets) + React Query / TanStack Query (para cache e sincronização assíncrona REST)
* **Mapas & Geoprocessamento:** React Leaflet + `leaflet.heat` (Heatmaps para pulverização e aplicação de insumos)
* **Comunicação em Tempo Real:** WebSockets (STOMP / SockJS) com *Debouncing/Throttling*
* **Estilização & UI:** Tailwind CSS + Material UI (MUI)
* **Ícones & Ativos Visuais:** `lucide-react` ou `react-icons` (Proibido uso de emojis)
* **APIs Externas:** Open-Meteo API (dados meteorológicos em tempo real)

---

## 2. Arquitetura de Pastas (Clean Architecture Front-end)

```text
frontend-shell/
├── Dockerfile                 # Multi-stage build para produção
├── src/
├── @types/                    # DTOs e interfaces de contratos (User, Telemetry, Auth)
├── assets/                    # Estilos globais e vetores SVG
├── components/                # Componentes reutilizáveis
│   ├── ui/                    # Modais, Banners, Badges, Inputs
│   └── map/                   # Componentes isolados do Leaflet
│       ├── MapShell.tsx       # Contêiner base do mapa
│       ├── TractorMarker.tsx  # Marcadores de máquinas
│       └── ApplicationHeatmap.tsx # Camada de calor de pulverização
├── hoc/                       # Higher-Order Components (HOCs)
│   ├── withAuth.tsx           # Validação e injeção de JWT
│   └── withTelemetryStream.tsx# Gerenciador de ciclo de vida do WebSocket
├── hooks/                     # Custom Hooks (useTractorData, useWeather, useAuth)
├── modules/                   # Módulos Funcionais (Telas e Abas)
│   ├── auth/                  # Módulo de Autenticação (Login / Cadastro)
│   ├── dashboard/             # Aba 1: Saúde da Frota & Telemetria
│   ├── mapping/               # Aba 2: Mapeamento de Campo & Clima
│   ├── fleet/                 # Aba 3: Gestão de Ativos (CRUD)
│   └── settings/              # Aba 4: Parâmetros e Regras
├── services/                  # Clientes de Comunicação Externa
│   ├── api.ts                 # Instância Axios (Spring Gateway + Interceptor JWT)
│   ├── weatherApi.ts          # Cliente para Open-Meteo API
│   └── websocket.ts           # Conexão STOMP / WebSocket
└── pages/                     # Rotas e Casca da Aplicação (Next.js)

```

---

## 3. Padrões Avançados de Arquitetura: HOCs & Debouncing

### 3.1. Higher-Order Components (HOCs)

Utilizamos o padrão HOC (Higher-Order Components) para injetar comportamentos transversais nos componentes de cada módulo sem duplicar código:

* **`withAuth`:** Envolve os componentes protegidos das abas do sistema. Verifica a existência e validade do token JWT no cliente Next.js. Caso o token seja inválido ou expirado, redireciona o usuário para a tela de Login e limpa o estado global.
* **`withTelemetryStream`:** Encapsula visões que demandam dados em tempo real (como o Dashboard e o Mapa). É responsável por abrir a conexão WebSocket quando a página é montada e realizar o *cleanup* (fechamento do socket) ao desmontar a página, injetando os dados limpos via *props*.

### 3.2. Estratégia de Debouncing / Throttling no WebSocket

Para evitar que o alto fluxo de pacotes de telemetria IoT (enviados a cada $n$ milissegundos) cause *re-renders* desnecessários e congelamento da interface no React:

* Os dados brutos recebidos via WebSocket são armazenados em um buffer interno em memória.
* Aplica-se uma função de **Debounce / Throttle** que dispara a atualização do estado visual no React (via Zustand) em um intervalo fixo de **1.000ms (1 segundo)**.
* Isso garante fluidez na renderização dos gráficos e marcadores de mapa, consumindo menos CPU do cliente.

---

## 4. Diretrizes de UX/UI & Regras Anti-Padrão de IA

* **Paleta de Cores Enterprise:**
* **Fundo Principal (Dark Mode):** `#0F172A` (Slate 900) — *sem pretos puros*.
* **Superfícies/Cards:** `#1E293B` (Slate 800) com borda `#334155` (Slate 700).
* **Verde Agro (Ação Primária/Sucesso):** `#367C2B` (Hover: `#2D6824`).
* **Amarelo Agrícola (Destaques/Atenção):** `#FFDE00`.
* **Status Crítico:** `#EF4444` | **Status Informativo:** `#3B82F6`.


* **Proibições Estritas para IAs de Código:**
* **Uso Zero de Emojis:** Proibido utilizar emojis em rótulos ou notificações. Apenas ícones vetoriais (`lucide-react`).
* **Inviolabilidade do Texto:** Proibido aplicar cores ou negrito apenas na metade/final das frases. Títulos devem ser em cor sólida e uniforme (`#F8FAFC`).


* **Escala Tipográfica (Fonte `Inter` ou `Roboto`):**
* **H1 (Títulos Principais):** `20px (1.25rem)` | Weight: `600` | Cor: `#F8FAFC`.
* **H2 (Cards/Headers):** `14px (0.875rem)` | Weight: `600` | Cor: `#94A3B8`.
* **KPIs Numéricos:** `28px (1.75rem)` | Weight: `700` | Fonte Monospaced.
* **Body / Tabelas:** `13px (0.8125rem)` | Weight: `400` | Cor: `#CBD5E1`.



---

## 5. Módulo de Autenticação (Login / Cadastro)

Interface em formato *Split Screen*:

* **Painel Esquerdo (60%):** Banner visual da marca com overlay escuro (`rgba(15, 23, 42, 0.85)`), logotipo e indicação de versão (`v1.0.0 Enterprise`).
* **Painel Direito (40%):** Formulário de login/cadastro com abas alternáveis (`Entrar` / `Cadastrar`), seleção de perfil de operador, inputs de e-mail e senha, e botão de submissão na cor verde `#367C2B`.
* Os tokens JWT retornados pela API são armazenados no cliente e injetados de forma automática em todas as chamadas HTTP e conexões de WebSocket.

---

## 6. Layout da Tela Inicial & Sidebar Retraível

* **Sidebar Retraível (Canto Superior Esquerdo):**
* **Trigger:** Ícone Hambúrguer (`Menu` do Lucide-React) posicionado em `top: 12px; left: 16px;`.
* **Estado Retraído:** `60px` de largura (somente ícones das abas).
* **Estado Expandido:** `240px` de largura (`transition: width 0.2s ease-in-out`), exibindo textos e perfil do usuário logado.



```text
+-----------------------------------------------------------------------------------+
| [≡] LOGO AGRO-IOT   | Status Conexão Kafka: [● On]   | Usuario (Agrônomo) [Sair]  | (Header: 50px)
+---+-------------------------------------------------------------------------------+
| M | METRICA 1: Frota Ativa | METRICA 2: Temp Média Engine | METRICA 3: Alertas    | (Row 1: 100px)
| E | [ 14 / 16 Máquinas ]   | [ 88.5 °C - Normal ]         | [ 2 Críticos ]        |
| N +-------------------------------------------------------+-----------------------+
| U | DISPLAY PRINCIPAL: TELEMETRIA EM TEMPO REAL           | PAINEL DE ALERTAS     | (Row 2: Flex-1)
|   | (Gráfico de Linha Múltipla - RPM vs Temp do Óleo)     | (Lista com Scroll)    |
| L |                                                       | - Trator JD-7230J     |
| A |                                                       |   Temp > 95°C (11:42) |
| T +-------------------------------------------------------+-----------------------+
| E | TABELA DE TELEMETRIA DETALHADA DA FROTA                                       | (Row 3: 200px)
| R | (ID Trator | Status | RPM | Temp | Velo | Combustível | Ações)                |
+---+-------------------------------------------------------------------------------+

```

---

## 7. Containerização Multi-Stage (Dockerfile)

```dockerfile
# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]

```

```

---

Assim que você confirmar, envio o arquivo em Markdown focado **exclusivamente no Back-end** na próxima resposta!

```