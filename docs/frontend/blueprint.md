```markdown
# Blueprint de Interface, Layout & Especificação de Displays (UI/UX)

Este documento especifica o blueprint visual, a disposição dos displays em CSS Grid/Flexbox, o guia de componentes e os critérios de usabilidade da **Plataforma Agro-IoT Integrada**. Ele serve como guia estrito para geradores de código e modelos de IA frontend.

---

## 1. Diretrizes Visuais & Padrões Anti-IA

Para garantir uma interface enterprise profissional e evitar artefatos genéricos de IA:

* **Paleta de Cores de Alta Densidade:**
  * **Fundo Principal (Dark Mode):** `#0F172A` (Slate 900) — *Sem pretos puros*.
  * **Superfícies/Cards:** `#1E293B` (Slate 800) com borda `#334155` (Slate 700).
  * **Verde Agro (Sucesso/Primário):** `#367C2B` (Hover: `#2D6824`).
  * **Amarelo Agrícola (Destaques/Atenção):** `#FFDE00`.
  * **Status Crítico:** `#EF4444` | **Status Informativo:** `#3B82F6`.
* **Proibições Estritas de Design:**
  * **Sem Emojis:** É proibido o uso de emojis (`🚜`, `⚠️`). Utilize exclusivamente ícones vetoriais da biblioteca `lucide-react`.
  * **Inviolabilidade de Texto:** Proibido destacar as últimas palavras de títulos em cores diferentes. Títulos devem manter tom sólido `#F8FAFC`.
* **Escala Tipográfica (Fonte `Inter` ou `Roboto`):**
  * **H1 (Títulos Principais):** `20px` (`1.25rem`) | Peso: `600` | Cor: `#F8FAFC`.
  * **H2 (Headers de Cards):** `14px` (`0.875rem`) | Peso: `600` | Cor: `#94A3B8`.
  * **Números de KPIs:** `28px` (`1.75rem`) | Peso: `700` | Fonte Monospaced/Tabular.
  * **Body / Tabelas:** `13px` (`0.8125rem`) | Peso: `400` | Cor: `#CBD5E1`.

---

## 2. Blueprint da Tela de Autenticação (Login / Cadastro)

A tela de autenticação adota o layout **Split Screen** responsivo:

```text
+----------------------------------------------------+------------------------------------+
|                                                    | PAINEL DE AUTENTICAÇÃO (40% width) |
|                                                    | +--------------------------------+ |
|                                                    | | [  Entrar  ]  [  Cadastrar  ]  | |
| PAINEL INSTITUCIONAL (60% width)                   | +--------------------------------+ |
| - Imagem em alta resolução de maquinário           | | E-mail Corporativo             | |
| - Overlay escuro (rgba(15, 23, 42, 0.85))          | | [ input_email                ] | |
| - Logotipo Agro-IoT Enterprise                     | | Senha                            | |
| - Versão do Sistema (v1.0.0 Enterprise)            | | [ input_password          (eye)] | |
|                                                    | | Perfil de Acesso                 | |
|                                                    | | [ Select: Operador/Agrônomo  v] | |
|                                                    | | +----------------------------+ | |
|                                                    | | |    ENTRAR NO SISTEMA       | | |
|                                                    | | +----------------------------+ | |
|                                                    | +--------------------------------+ |
+----------------------------------------------------+------------------------------------+

```

---

## 3. Disposição dos Displays: Dashboard Inicial (Aba 1)

Layout de alta densidade baseado em **CSS Grid** (`display: grid; grid-template-columns: 3fr 2fr; grid-template-rows: 50px 100px 1fr 200px; gap: 16px;`):

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

### Especificação da Sidebar Retraível (Canto Superior Esquerdo)

* **Trigger:** Ícone Hambúrguer (`Menu` do Lucide-React) posicionado em `top: 12px; left: 16px;`.
* **Estado Retraído (Padrão):** Largura de `60px`, exibindo apenas os ícones das abas.
* **Estado Expandido (Toggle):** Largura de `240px` (`transition: width 0.2s ease-in-out`), sobrepondo o conteúdo com sombra (`box-shadow`) e revelando os rótulos das abas.

---

## 4. Disposição dos Displays: Mapeamento e Pulverização (Aba 2)

Layout de tela cheia para geoprocessamento em tempo real com **React Leaflet**:

```markdown
#### Estrutura de Camadas (Z-Index Hierarchy):
1. **Camada Base (z-index: 0):** Contêiner `<MapShell/>` com `width: 100%` e `height: calc(100vh - 50px)`.
2. **Painel Flutuante Esquerdo (z-index: 10):** Filtro e Seleção de Máquina/Talhão.
   - `position: absolute; top: 16px; left: 16px; width: 320px; max-height: 80vh; background: #1E293B; border: 1px solid #334155; border-radius: 8px;`
3. **Widget Flutuante Direito Superior (z-index: 10):** Clima em Tempo Real (Open-Meteo).
   - `position: absolute; top: 16px; right: 16px; width: 280px; background: #1E293B; border-radius: 8px; padding: 12px;`
4. **Widget Flutuante Inferior (z-index: 10):** Legenda do Heatmap de Insumos (`leaflet.heat`).
   - `position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); height: 40px; padding: 0 16px; background: #0F172A; border-radius: 20px;`

```

---

## 5. Especificação dos Componentes de UI

1. **`MapShell`:** Invólucro do Leaflet com controle de zoom centralizado e camada de satélite/vetorial.
2. **`TractorMarker`:** Marcador dinâmico de máquina com rotação baseada no *heading* (direção) e cor indicativa de status.
3. **`ApplicationHeatmap`:** Camada de calor alimentada pelo buffer de telemetria de aplicação de defensivos/fertilizantes.
4. **`TelemetryCard`:** Card de KPI com valor numérico em destaque (fonte monospaced) e indicador de variação em relação ao histórico.
5. **`AlertBanner`:** Painel de alertas críticos com scroll de alta densidade e acionamento de modal de confirmação para ações corretivas.

---

## 6. Critérios de Usabilidade & UX Agrícola

* **Regra dos 3 Segundos:** A saúde geral da frota deve ser compreendida instantaneamente via *color-coding* (Verde = Normal, Amarelo = Atenção, Vermelho = Crítico).
* **Alta Visibilidade no Campo:** Rótulos e valores numéricos utilizam alto contraste sobre fundo escuro para leitura sob luz solar ou cabines noturnas.
* **Prevenção de Falhas:** Ações operacionais críticas (ex: desligar pulverização ou alterar parâmetros de alerta) exigem confirmação em duas etapas.

```

```