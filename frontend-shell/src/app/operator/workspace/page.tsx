'use client';

import { useState } from 'react';
import { Plus, AlertTriangle, Fuel, Wrench, CloudRain, Utensils } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  OperatorHeader,
  OrderActionDock,
  DowntimeModal,
  type WorkOrderStatus,
  type DowntimeReason,
} from '@/modules/operator';

const REASON_ICONS: Record<DowntimeReason, typeof Fuel> = {
  REFUELING:            Fuel,
  MECHANICAL_BREAKDOWN: Wrench,
  WEATHER_ADVERSE:      CloudRain,
  MEAL_BREAK:           Utensils,
};

/**
 * Operator Workspace.
 *
 * Touch-friendly, full-bleed grid:
 *   row 1: <OperatorHeader>
 *   row 2: <OrderActionDock>  |  Apontamento Rapido
 *   row 3: Alertas & Parametros
 *
 * The active work order is currently mocked; Change 021 will plug in
 * a real TanStack Query against /api/v1/operations/work-orders.
 */
export default function OperatorWorkspacePage() {
  const user = useAuthStore((s) => s.user);
  const [downtimeOpen, setDowntimeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Mock O.S. ativa (Change 021 trara a query real).
  const activeOrder: {
    id: string;
    equipmentId: string;
    status: WorkOrderStatus;
  } = {
    id: 'WO-MOCK-001',
    equipmentId: 'TRAC-7230J-001',
    status: 'PENDING',
  };

  const operatorName = user?.fullName ?? user?.email?.split('@')[0] ?? 'Operador';

  return (
    <main className="min-h-screen bg-bg p-4 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <OperatorHeader
          equipmentId={activeOrder.equipmentId}
          equipmentModel="7230J"
          operatorName={operatorName}
          operatorCode={user?.id ?? 'OP-????'}
          connected
        />

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <article className="space-y-3 rounded-md border border-border bg-card p-5">
            <div className="space-y-1">
              <p className="text-[0.6875rem] font-medium uppercase tracking-widest text-fg-muted">
                Ordem de servico ativa
              </p>
              <p className="font-mono text-sm font-semibold text-fg">
                {activeOrder.id} - Pulverizacao de Precisao
              </p>
              <p className="text-xs text-fg-muted">
                Talhao: Talhao 01 - Soja  |  Meta: 150 L/ha  |  Velocidade alvo: 14.0 km/h
              </p>
            </div>

            <OrderActionDock
              workOrderId={activeOrder.id}
              equipmentId={activeOrder.equipmentId}
              status={activeOrder.status}
            />
          </article>

          <article className="space-y-3 rounded-md border border-border bg-card p-5">
            <p className="text-[0.6875rem] font-medium uppercase tracking-widest text-fg-muted">
              Apontamento rapido
            </p>
            <button
              type="button"
              onClick={() => setDowntimeOpen(true)}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-md bg-critical px-4 text-sm font-bold uppercase tracking-wider text-fg transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-critical"
            >
              <Plus size={20} aria-hidden />
              Registrar parada
            </button>

            <ul className="space-y-1.5 text-xs text-fg-muted">
              {(['REFUELING', 'MECHANICAL_BREAKDOWN', 'WEATHER_ADVERSE', 'MEAL_BREAK'] as DowntimeReason[]).map((r) => {
                const Icon = REASON_ICONS[r];
                return (
                  <li key={r} className="flex items-center gap-2">
                    <Icon size={14} aria-hidden />
                    {labelOf(r)}
                  </li>
                );
              })}
            </ul>
          </article>
        </section>

        <section className="rounded-md border border-border bg-card p-5">
          <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-widest text-fg-muted">
            Alertas locais & parametros do motor
          </p>
          <p className="font-mono text-sm text-fg">
            <span className="text-fg-muted">RPM</span> 2100
            <span className="px-2 text-fg-muted">|</span>
            <span className="text-fg-muted">Temp</span> 87.5 &deg;C
            <span className="px-2 text-fg-muted">|</span>
            <span className="text-fg-muted">Combustivel</span> 82%
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-fg-muted">
            <AlertTriangle size={12} aria-hidden />
            Sem alertas ativos nesta janela.
          </p>
        </section>
      </div>

      <DowntimeModal
        open={downtimeOpen}
        equipmentId={activeOrder.equipmentId}
        onClose={() => setDowntimeOpen(false)}
        onSubmitted={(msg) => setToast(msg)}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 rounded-md border border-brand bg-card px-4 py-2 text-sm text-fg shadow-lg"
          onAnimationEnd={() => setToast(null)}
        >
          {toast}
        </div>
      )}
    </main>
  );
}

function labelOf(r: DowntimeReason): string {
  switch (r) {
    case 'REFUELING':            return 'Abastecimento';
    case 'MECHANICAL_BREAKDOWN': return 'Manutencao / Quebra';
    case 'WEATHER_ADVERSE':      return 'Clima Adverso';
    case 'MEAL_BREAK':           return 'Intervalo';
  }
}
