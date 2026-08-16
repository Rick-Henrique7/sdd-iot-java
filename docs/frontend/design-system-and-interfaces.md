```markdown
# Especificação Técnica: Design System & Interfaces do Front-end (Next.js)

Este documento estabelece o blueprint completo de UI/UX, tokens visuais, hierarquia de navegação e componentes das duas interfaces principais da plataforma: a **Interface de Operações do Operador (Tablet/Terminal de Bordo)** e o **Painel Enterprise do Gestor**.

---

## 1. Diretrizes Globais de Design System & Tokens Visuais

Para garantir um padrão visual industrial *Enterprise*, a aplicação segue rígidas regras de design:

### 1.1. Paleta de Cores (Dark Mode Slate)
* **Fundo Principal (Canvas):** `#0F172A` (Slate 900) — *Proibido o uso de preto puro (`#000000`)*.
* **Cards & Containers:** `#1E293B` (Slate 800) com borda fina de 1px em `#334155` (Slate 700).
* **Verde de Operação Normal (Primário):** `#367C2B` (Hover: `#2D6824`).
* **Amarelo de Alerta Médio/Atenção:** `#F59E0B` (Slate 900 para textos em fundos amarelos).
* **Vermelho de Alerta Crítico:** `#EF4444`.
* **Azul Informativo:** `#3B82F6`.

### 1.2. Proibições Estritas de UI (Anti-Padrões)
* **Zero Emojis:** É estritamente proibido incluir emojis (ex: 🚜, ⚠️, 🌾) em botões, rótulos ou modais. Utilize exclusivamente os ícones vetoriais da biblioteca `lucide-react`.
* **Inviolabilidade Tipográfica:** Proibido alterar a cor ou peso das últimas palavras de uma frase em títulos (ex: proibidíssimo renderizar "*Painel de* **Operações**"). Títulos possuem cor única e sólida (`#F8FAFC`).
* **Fontes Tabulares:** Todos os valores numéricos de telemetria (RPM, Temperatura, Coordenadas) utilizam variante numérica de largura fixa (`font-mono`) para evitar tremor de layout durante atualizações do WebSocket.

---

## 2. Interface 1: Workspace do Operador (`/operator/workspace`)

Projetada para ser utilizada em tablets industriais de alta resistência dentro da cabine do maquinário. Foco em facilidade de toque, botões grandes e ausência de distrações.

### 2.1. Disposição do Layout (Grid Touch-Friendly)

```text
+-----------------------------------------------------------------------------------+
|  EQUIPAMENTO: TRAC-7230J-001 | OPERADOR: João Silva (OP-9942) | STATUS: CONECTADO  |
+----------------------------------------------------+------------------------------+
|                                                    |                              |
|  PAINEL DA ORDEM DE SERVIÇO ATIVA                  |  APONTAMENTO RÁPIDO PARADA   |
|                                                    |                              |
|  O.S. #1084 - Pulverização de Precisão             |  [ REGISTRAR PARADA ]        |
|  Talhão: Talhão 01 - Soja | Meta: 150 L/ha         |                              |
|  Velocidade Alvo: 14.0 km/h                        |  • Abastecimento             |
|                                                    |  • Manutenção / Quebra       |
|  +----------------------------------------------+  |  • Clima Adverso / Chuva     |
|  | [▶ INICIAR]    [⏸ PAUSAR]   [✅ CONCLUIR]    |  |  • Intervalo / Almoço        |
|  +----------------------------------------------+  |                              |
+----------------------------------------------------+------------------------------+
|  ALERTAS LOCAIS & PARÂMETROS DO MOTOR (RPM: 2100 | Temp: 87.5°C | Combustível: 82%) |
+-----------------------------------------------------------------------------------+
```

### 2.2. Componentes Principais do Operador

- **Header de Identificação (`OperatorHeader.tsx`):** Exibe o identificador único do trator/colheitadeira, nome do operador autenticado via JWT e indicador visual da conexão STOMP/WebSocket.
- **Barra de Ação Contínua (`OrderActionDock.tsx`):** Botões com área de toque mínima de 64px de altura para início, pausa ou conclusão de tarefas agrícolas com feedback tátil/visual imediato.
- **Modal de Registro de Parada (`DowntimeModal.tsx`):** Abre ao acionar a parada, permitindo selecionar em 2 toques a categoria do motivo (Refeição, Manutenção, Abastecimento, Clima) e enviar requisição `POST /api/v1/operations/downtime`.

---

## 3. Interface 2: Painel Enterprise do Gestor (`/dashboard`)

Desenvolvido para estações de trabalho de centro de controle de operações (CCO), utilizando a Sidebar lateral de 6 módulos funcionais.

### 3.1. Reestruturação da Sidebar Lateral (`Sidebar.tsx`)

A barra de navegação fica fixada à esquerda com recolhimento opcional:

```text
+------------------------------------------+
|  Agro-IoT ENTERPRISE  • Kafka Online     |
+------------------------------------------+
|  [LayoutDashboard]  Dashboard Preditivo  |
|  [Map]              Mapeamento de Campo  |
|  [ClipboardList]    Gestão de Operações  |
|  [Tractor]          Frota de Equipamentos|
|  [Wrench]           Manutenção Preditiva |
|  [Settings]         Configurações        |
+------------------------------------------+
|  [User] gestor@agrio.local [LogOut]      |
+------------------------------------------+
```

### 3.2. Detalhamento dos Módulos do Gestor

#### Aba 1: Dashboard Preditivo & Telemetria (`/dashboard`)

- **Top Metrics Grid:** Cards de KPI em tempo real (Total de Máquinas Ativas, Temperatura Média de Motores, Alertas Críticos da Sessão).
- **Gráfico de Linha de Telemetria (Recharts):** Leitura via WebSocket com buffer de Debounce de 1000ms para evitar estouro de re-renderização do React.
- **Painel do Feed de Alertas:** Lista em cascata dos alertas empurrados pelo `alert-processing-service`.

#### Aba 2: Mapeamento Geográfico & Heatmap (`/mapping`)

- **MapShell (React Leaflet):** Renderizador vetorial dos limites dos talhões agrícolas com marcadores customizados apontando a orientação/azimute do veículo.
- **Camada Heatmap (`leaflet.heat`):** Gráficos de calor sobrepostos ao mapa representando a taxa variável de aplicação de insumos em L/ha gerada pelos dados de rastreamento.
- **Widget Climatológico:** Consulta direta à API Open-Meteo com indicadores de velocidade de vento e precipitação no talhão.

#### Aba 3: Gestão de Operações & O.S. (`/operations`)

Tabela de acompanhamento ao vivo do progresso das Ordens de Serviço enviadas aos operadores e gráfico de pizza de eficiência de tempo (Tempo Trabalhado vs. Tempo em Parada Ociosa).

#### Abas 4-6 (placeholders)

- **Aba 4: Frota de Equipamentos (`/fleet`)** — CRUD de maquinário (já implementado no Change 009).
- **Aba 5: Manutenção Preditiva (`/maintenance`)** — Controle de horímetro e revisões (placeholder para Change futura).
- **Aba 6: Configurações (`/settings`)** — Parametrização de thresholds e permissões (já implementado no Change 010).

---

## 4. Gerenciamento de Estado e Performance do Front-end

```text
               +----------------------------------+
               |  Servidor WebSocket / Kafka      |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               | Custom Hook: useTelemetryStream  |
               +----------------------------------+
                                |
                    (Debouncing / Throttle 1s)
                                |
                                v
               +----------------------------------+
               |  Estado Global Zustand (Store)   |
               +----------------------------------+
                   /                            \
                  v                              v
    +---------------------------+  +---------------------------+
    | Visualizador de Métricas  |  | Camada do Mapa Leaflet    |
    | (Gráficos / Gauge Widgets)|  | (Atualização de Posição)  |
    +---------------------------+  +---------------------------+
```

- **Estado Assíncrono REST:** Gerenciado via **TanStack Query (React Query)** com Stale-While-Revalidate para dados de cadastro de frotas e ordens de serviço, oferecendo resiliência contra instabilidades da rede.
- **Estado de Telemetria de Alta Frequência:** Gerenciado via **Zustand** isolado da árvore principal de componentes para garantir performance fluida de 60 FPS.

---

## 5. Mapeamento de Rotas do Next.js (App Router)

```text
src/
└── app/
    ├── login/                          # Autenticação
    │   └── page.tsx
    ├── register/                       # Registro de operador/gestor
    │   └── page.tsx
    ├── operator/                       # NOVA rota — perfil Operador
    │   └── workspace/
    │       └── page.tsx
    └── (gestor)/                       # Layout shell com a nova Sidebar
        ├── layout.tsx
        ├── dashboard/                  # Aba 1
        ├── mapping/                    # Aba 2
        ├── operations/                 # Aba 3
        ├── fleet/                      # Aba 4
        ├── maintenance/                # Aba 5
        └── settings/                   # Aba 6
```

---

## 6. Próximos Passos

1. Criar `changes/<NNN>-frontend-design-system/proposal.md + spec.md + design.md + tasks.md` aplicando a SDD.
2. Migrar `docs/frontend/blueprint.md` para refletir o split entre `ROLE_GESTOR` e `ROLE_OPERADOR`.
3. Atualizar o `tailwind.config.ts` com os tokens explícitos (`#0F172A`, `#1E293B`, `#334155`, `#F8FAFC`, `#367C2B`, `#2D6824`, `#F59E0B`, `#EF4444`, `#3B82F6`) em `theme.extend.colors` (a `brand`/`fg-*/bg-*`/`card-2` já cobrem a maioria — só falta documentar).
4. Criar os 3 novos componentes: `OperatorHeader.tsx`, `OrderActionDock.tsx`, `DowntimeModal.tsx`.
5. Adicionar a regra de lint customizada para **proibir emojis em `.tsx`** (regex scanner ou rule do eslint-plugin-no-emoji).
6. Adicionar a regra de **font-mono em valores numéricos** como convenção revisada em code review (sem lint obrigatório).
7. Atualizar o `README.md` raiz com a seção "Personas & Permissões" e a sub-seção "Design System".
```
