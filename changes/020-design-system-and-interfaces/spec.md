# Spec — Design System & Interfaces (020)

## Contrato visual

### 1. Paleta de tokens (formalização)

| Token             | Hex       | Uso                                                 |
|-------------------|-----------|-----------------------------------------------------|
| `bg`              | `#0F172A` | Canvas da aplicação (slate-900).                    |
| `card`            | `#1E293B` | Fundo de cards/painéis (slate-800).                 |
| `card-2`          | `#172033` | Sub-áreas dentro de cards (delta mais escuro).      |
| `border`          | `#334155` | Borda fina 1px (slate-700).                         |
| `fg`              | `#F8FAFC` | Texto primário (H1).                                |
| `fg-muted`        | `#94A3B8` | Texto secundário (H2, labels).                      |
| `fg-body`         | `#CBD5E1` | Texto de corpo.                                     |
| `brand`           | `#367C2B` | Verde John Deere (DEFAULT).                         |
| `brand-hover`     | `#2D6824` | Verde John Deere (hover).                           |
| `brand-soft`      | `#1F4A19` | Verde John Deere (fundos suaves).                   |
| `accent`          | `#FFDE00` | Amarelo agrícola (manutenção).                     |
| `warning`         | `#F59E0B` | Atenção média.                                      |
| `critical`        | `#EF4444` | Alerta crítico.                                     |
| `info`            | `#3B82F6` | Informativo.                                        |

> **Inviolabilidade:** preto puro `#000000` é proibido; `bg` é sempre
> slate-900. Tipografia: a **última palavra de um título** nunca pode
> mudar de cor ou peso em relação ao restante.

### 2. Anti-padrões (regras invioláveis)

1. **Zero emojis** em qualquer `.tsx` (botões, rótulos, modais, títulos,
   comentários de UI). Apenas ícones vetoriais `lucide-react`.
2. **Font-mono** em valores numéricos de telemetria: RPM, temperatura,
   velocidade, horímetro, coordenadas GPS, latência.
3. **Sem variação de cor/peso** na última palavra de títulos.
4. **Sem preto puro** `#000000` em qualquer lugar.

### 3. Componentes do Operador

#### 3.1 `OperatorHeader.tsx`

Props:

```ts
interface OperatorHeaderProps {
  equipmentId: string;        // ex.: "TRAC-7230J-001"
  equipmentModel?: string;    // ex.: "7230J" (opcional)
  operatorName: string;       // ex.: "João Silva"
  operatorCode: string;       // ex.: "OP-9942"
  connected: boolean;         // estado da conexão STOMP
}
```

Renderiza uma faixa horizontal com 3 blocos:

- **Esquerda:** `equipmentId` em `font-mono` (alta legibilidade) +
  `equipmentModel` menor.
- **Centro:** `operatorName` + `operatorCode` em `font-mono`.
- **Direita:** indicador "CONECTADO" (verde) ou "SEM CONEXÃO" (vermelho)
  com bolinha pulsante.

#### 3.2 `OrderActionDock.tsx`

Props:

```ts
type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

interface OrderActionDockProps {
  workOrderId: string;
  equipmentId: string;
  status: WorkOrderStatus;
  onStatusChange: (next: WorkOrderStatus) => void;
  disabled?: boolean;
}
```

Renderiza 3 botões (Iniciar / Pausar / Concluir) com altura mínima de
**64px** (touch-friendly), ocupando a linha inteira do container.
Cada botão:

- `flex-1` para ocupar o espaço disponível.
- Ícone lucide à esquerda (`Play`, `Pause`, `CheckCircle`).
- Cor de fundo semafórica: verde (`bg-brand`) para iniciar, amarelo
  (`bg-accent`) para pausar, azul (`bg-info`) para concluir.
- `aria-label` em PT-BR.
- Estado desabilitado: `opacity-50 cursor-not-allowed`.

#### 3.3 `DowntimeModal.tsx`

Props:

```ts
type DowntimeReason = 'REFUELING' | 'MECHANICAL_BREAKDOWN'
                     | 'WEATHER_ADVERSE' | 'MEAL_BREAK';

interface DowntimeModalProps {
  open: boolean;
  equipmentId: string;
  onClose: () => void;
  onSubmitted?: (message: string) => void;
}
```

Comportamento:

- Quando `open` muda para `true`, renderiza overlay + card central.
- Lista 4 botões grandes (1 por motivo) com altura mínima 64px. Cada botão
  mostra label PT-BR + valor técnico:
  - `REFUELING` → "Abastecimento"
  - `MECHANICAL_BREAKDOWN` → "Manutenção / Quebra"
  - `WEATHER_ADVERSE` → "Clima Adverso"
  - `MEAL_BREAK` → "Intervalo"
- 1 toque seleciona o motivo (estado interno `selected`).
- 2 toques: 1º seleciona, 2º confirma e dispara
  `POST /api/v1/operations/downtime` com body
  `{ equipmentId, reason, notes? }`.
- Após resposta 2xx, fecha o modal e chama `onSubmitted('Parada registrada')`.
- Erro de rede mostra toast de erro (componente `Toast` reutilizado).
- `Esc` ou clique no overlay fecha sem submeter.

### 4. Rota `/operator/workspace`

Layout grid de 3 seções (responsivo):

```
+----------------------------------------------------------+
| <OperatorHeader>                                          |
+--------------------------------+-------------------------+
| <OrderActionDock>              | <Card "Apontamento">    |
| + Card com O.S. ativa          |  Botão "Registrar Parada"
|   (placeholder por ora)        |  → abre <DowntimeModal> |
+--------------------------------+-------------------------+
| <Card "Alertas & Parâmetros">  (RPM, Temp, Combustível)  |
+----------------------------------------------------------+
```

Sem `Sidebar` lateral (rota dedicada, fora do route group `(app)`).

### 5. Regra ESLint `no-emoji`

- Arquivo: `frontend-shell/.eslint-plugin/no-emoji.js`.
- Rule exporta função que recebe `context` do ESLint.
- Visita `Literal`, `TemplateElement`, `JSXText` e `JSXAttribute`.
- Regex de proibição:
  ```js
  const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27FF}]/u;
  ```
- Reporta `error` (não warning) quando acha match.
- Configurada no `.eslintrc.json` para `*.tsx` e `*.ts` da `src/`.

## Contrato de API consumido

`POST /api/v1/operations/downtime`

```json
{
  "equipmentId": "TRAC-7230J-001",
  "reason": "MECHANICAL_BREAKDOWN",
  "notes": "Vibração anômala no motor"
}
```

Resposta 2xx: `{ id, equipmentId, reason, startedAt, endedAt? }`.

## Critérios de aceite (gherkin-like)

- **DADO** que o operador abre `/operator/workspace`
- **QUANDO** a página renderiza
- **ENTÃO** vejo o `OperatorHeader` com meu nome, código e indicador
  verde de conexão.

- **DADO** que existe uma O.S. ativa
- **QUANDO** eu toco "INICIAR"
- **ENTÃO** o `OrderActionDock` chama `PATCH /api/v1/operations/work-orders/{id}/status` com `{ status: 'IN_PROGRESS' }`
- **E** os 3 botões refletem o novo estado.

- **DADO** que eu toco "REGISTRAR PARADA"
- **QUANDO** o `DowntimeModal` abre
- **E** eu seleciono "Manutenção / Quebra"
- **E** eu toco novamente para confirmar
- **ENTÃO** `POST /api/v1/operations/downtime` é chamado
- **E** o modal fecha com mensagem de sucesso.

- **DADO** que algum PR adiciona um emoji em um `.tsx`
- **QUANDO** `npm run lint` roda
- **ENTÃO** o build falha com a mensagem da rule `no-emoji`.
