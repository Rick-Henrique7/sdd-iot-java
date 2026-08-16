```markdown
# Especificação Técnica: UI/UX Blueprint — Perfil Operador & Expansão do Gestor

Este documento especifica os novos módulos visuais do front-end Next.js, detalhando a interface simplificada e focada em ações do **Perfil Operador** e a expansão da barra de navegação lateral (**Sidebar**) do **Perfil Gestor**.

---

## 1. Visão Geral das Permissões por Perfil

A navegação e a renderização de componentes são controladas estritamente com base no perfil autenticado no token JWT (`ROLE_GESTOR` ou `ROLE_OPERADOR`).

* **`ROLE_OPERADOR`:** Redirecionado automaticamente para a rota dedicada `/operator/workspace`. Interface adaptada para tablets/telas sensíveis ao toque (touch-friendly) no campo.
* **`ROLE_GESTOR`:** Acesso completo à rota `/dashboard` e à nova Sidebar expandida de 6 módulos funcionais.

---

## 2. Interface do Operador (`/operator/workspace`)

A tela do operador é um painel de bordo simplificado de alta visibilidade (alto contraste) com botões grandes para fácil interação no trator.

### 2.1. Estrutura de Layout (Grid de 3 Seções)

```text
+-----------------------------------------------------------------------+
|  STATUS DA MÁQUINA: TRAC-7230J-001 | OPERADOR: João Silva (OP-9942)  |
+------------------------------------+----------------------------------+
|                                    |                                  |
|   ORDEM DE SERVIÇO ATIVA           |   AÇÕES RÁPIDAS (APONTAMENTOS)   |
|                                    |                                  |
|   O.S. #1084 - Pulverização        |   [ 🛑 REGISTRAR PARADA ]        |
|   Talhão: Talhão 01 - Soja         |                                  |
|   Meta: 150 L/ha | Vel: 14 km/h    |   [ ⛽ Abastecimento ]          |
|                                    |   [ 🔧 Manutenção ]              |
|   [▶ INICIAR]  [⏸ PAUSAR]          |   [ 🌧️ Clima Adverso ]           |
|   [✅ CONCLUIR TAREFA]             |   [ 🍽️ Intervalo ]               |
|                                    |                                  |
+------------------------------------+----------------------------------+
|  FEED DE NOTIFICAÇÕES & DICAS DE PARÂMETROS OPERACIONAIS              |
+-----------------------------------------------------------------------+
```

### 2.2. Modal de Apontamento de Parada (Registro de Downtime)

Ao clicar no botão "Registrar Parada", um modal sobrepõe a tela com opções de seleção rápida e campo opcional de observação:

**Motivos Pré-definidos:**

- `REFUELING` (Reabastecimento)
- `MECHANICAL_BREAKDOWN` (Manutenção/Quebra)
- `WEATHER_ADVERSE` (Clima Adverso / Chuva)
- `MEAL_BREAK` (Intervalo / Almoço)

**Integração com Back-end:** Realiza um `POST` para `/api/v1/operations/downtime` e emite um evento no Kafka para que a parada apareça instantaneamente no mapa do Gestor.

---

## 3. Reestruturação da Sidebar Lateral do Gestor (`Sidebar.tsx`)

A barra lateral do perfil Gestor passa a contar com **6 abas funcionais**, organizadas por domínio de negócio com ícones da biblioteca `lucide-react`:

```text
+------------------------------------+
|  Agro-IoT ENTERPRISE  • Kafka On   |
+------------------------------------+
|  📊  Dashboard (Saúde & Preditiva) |
|  🗺️  Mapeamento de Campo            |
|  📋  Gestão de Operações & O.S.    |  <-- NOVA
|  🚜  Frota de Equipamentos         |
|  🛠️  Manutenção Preditiva          |  <-- NOVA
|  ⚙️  Configurações & Acessos        |
+------------------------------------+
|  👤  gestor@agrio.local [Sair]   |
+------------------------------------+
```

---

## 4. Mapeamento de Rotas do Next.js (App Router)

```text
src/
└── app/
    ├── login/
    │   └── page.tsx                 # Tela de Autenticação / Registro
    ├── operator/
    │   └── workspace/
    │       └── page.tsx             # Workspace Exclusivo do Operador
    └── (gestor)/
        ├── layout.tsx               # Layout Shell com a nova Sidebar
        ├── dashboard/
        │   └── page.tsx             # Aba 1: Métricas Telemetria ao vivo
        ├── mapping/
        │   └── page.tsx             # Aba 2: Mapa Leaflet + Heatmap
        ├── operations/
        │   └── page.tsx             # Aba 3: Acompanhamento de O.S. e Paradas
        ├── fleet/
        │   └── page.tsx             # Aba 4: CRUD de Maquinário
        ├── maintenance/
        │   └── page.tsx             # Aba 5: Controle de Horímetro & Revs
        └── settings/
            └── page.tsx             # Aba 6: Parametrização e Permissões
```

---

## 5. Exemplo de Componente React: Ações do Operador (`OperatorActions.tsx`)

```tsx
'use client';

import React, { useState } from 'react';
import { Play, Pause, CheckCircle, AlertOctagon } from 'lucide-react';

interface OperatorActionsProps {
  workOrderId: string;
  equipmentId: string;
}

export const OperatorActions: React.FC<OperatorActionsProps> = ({ workOrderId, equipmentId }) => {
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'PAUSED'>('PENDING');

  const handleStatusChange = async (newStatus: 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED') => {
    setStatus(newStatus === 'COMPLETED' ? 'PENDING' : newStatus);
    await fetch(`/api/v1/operations/work-orders/${workOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
      <h3 className="text-slate-100 font-semibold text-lg">Controle da Ordem de Serviço</h3>
      <div className="grid grid-cols-2 gap-4">
        {status !== 'IN_PROGRESS' ? (
          <button
            onClick={() => handleStatusChange('IN_PROGRESS')}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-lg font-bold"
          >
            <Play className="w-5 h-5"/> INICIAR TAREFA
          </button>
        ) : (
          <button
            onClick={() => handleStatusChange('PAUSED')}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white p-4 rounded-lg font-bold"
          >
            <Pause className="w-5 h-5"/> PAUSAR TAREFA
          </button>
        )}

        <button
          onClick={() => handleStatusChange('COMPLETED')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-lg font-bold"
        >
          <CheckCircle className="w-5 h-5"/> CONCLUIR
        </button>
      </div>
    </div>
  );
};
```

---

## 6. Próximos Passos

1. Criar `changes/<NNN>-frontend-operator-profile/proposal.md + spec.md + design.md + tasks.md` aplicando a SDD.
2. Reorganizar o `app/` em dois route groups paralelos: `(gestor)/` (shell existente) e `operator/workspace/` (rota dedicada, sem shell lateral).
3. Atualizar o `authStore` (ou criar um hook `useRoleGuard`) para fazer redirect automático em login: `ROLE_OPERADOR` → `/operator/workspace`, `ROLE_GESTOR` → `/dashboard`.
4. Atualizar o `Sidebar.tsx` para renderizar condicionalmente os 6 itens de Gestor (e **não** renderizar para `ROLE_OPERADOR`).
5. Estender o `formatRole` (já criado no Change 011) para reconhecer também `ROLE_OPERADOR` no header/perfil.
6. Adicionar a nova rota `/operator/workspace` ao `vitest` smoke test (verificar que renderiza o nome do operador + 4 botões de apontamento).
7. Atualizar o `README.md` raiz com a nova rota, screenshot do workspace do operador e item na tabela de changes.
```
