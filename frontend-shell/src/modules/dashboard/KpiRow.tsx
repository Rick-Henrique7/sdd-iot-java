'use client';

import { Activity, AlertTriangle, ThermometerSun } from 'lucide-react';
import { useKpis } from '@/hooks/useKpis';
import { KpiCard, type KpiTone } from './KpiCard';

export function KpiRow() {
  const kpis = useKpis();

  const tempTone: KpiTone = kpis.avgTemp.state;
  const alertTone: KpiTone =
    kpis.criticalAlerts > 0 ? 'critical' : 'ok';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <KpiCard
        label="Frota Ativa"
        value={
          kpis.isLoading ? (
            <span className="text-fg-muted">—</span>
          ) : (
            <>
              {kpis.activeFleet.seen}
              <span className="text-fg-muted"> / {kpis.activeFleet.total}</span>
            </>
          )
        }
        hint="Equipamentos transmitindo nos últimos 60 s"
        icon={Activity}
        tone={kpis.activeFleet.seen > 0 ? 'ok' : 'idle'}
      />
      <KpiCard
        label="Temp. Média do Motor"
        value={
          kpis.avgTemp.value > 0 ? (
            <>
              {kpis.avgTemp.value.toFixed(1)}
              <span className="text-base text-fg-muted"> °C</span>
            </>
          ) : (
            <span className="text-fg-muted">—</span>
          )
        }
        hint="Média móvel, últimos 5 min"
        icon={ThermometerSun}
        tone={tempTone === 'idle' ? 'idle' : tempTone}
      />
      <KpiCard
        label="Alertas Críticos"
        value={kpis.criticalAlerts}
        hint="Severidade CRITICAL na sessão"
        icon={AlertTriangle}
        tone={alertTone}
      />
    </div>
  );
}
