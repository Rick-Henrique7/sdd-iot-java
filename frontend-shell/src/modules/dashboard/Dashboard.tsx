'use client';

import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { AlertPanel } from './AlertPanel';
import { FleetTable } from './FleetTable';
import { KpiRow } from './KpiRow';
import { TelemetryChart } from './TelemetryChart';

/**
 * The Dashboard is now a pure-UI component on top of the global
 * `telemetryStore` / `alertsStore` populated by
 * `TelemetryStreamMount` in `(app)/layout.tsx`. The WebSocket
 * lifecycle is no longer owned by the dashboard, so navigating
 * to `/mapping` keeps the live data flowing.
 */
export function Dashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <section className="animate-fade-in space-y-4">
      <header className="space-y-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <LayoutDashboard size={12} aria-hidden />
          <h1 className="text-h1 font-semibold text-fg">Dashboard</h1>
        </span>
        
        <p className="text-sm text-fg-muted">
          Saúde geral da frota, telemetria em tempo real e feed de alertas.
        </p>
      </header>

      <KpiRow />

      <div className="grid h-[600px] grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="min-h-0 overflow-hidden lg:col-span-2">
          <TelemetryChart
            selectedId={selectedId}
            onChangeSelected={setSelectedId}
          />
        </div>
        <div className="min-h-0 overflow-hidden lg:col-span-1">
          <AlertPanel />
        </div>
      </div>

      <FleetTable />
    </section>
  );
}
