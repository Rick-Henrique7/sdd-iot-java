'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { RelativeTime } from '@/components/dashboard/RelativeTime';
import { SeverityDot } from '@/components/dashboard/SeverityDot';
import { useRecentAlerts } from '@/hooks/useRecentAlerts';
import type { Alert } from '@/types/alert';
import { AlertRow } from './AlertRow';

export function AlertPanel() {
  const { alerts } = useRecentAlerts();
  const [open, setOpen] = useState<Alert | null>(null);

  return (
    <div className="panel flex h-full flex-col p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-fg-muted" aria-hidden />
          <h2 className="text-h2 uppercase tracking-wider text-fg-muted">
            Alertas
          </h2>
        </div>
        <span className="text-xs text-fg-muted">
          {alerts.length === 0 ? 'aguardando feed…' : `${alerts.length} recentes`}
        </span>
      </header>

      <ul className="flex-1 space-y-1 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <li className="grid h-32 place-items-center text-xs text-fg-muted">
            Nenhum alerta recebido nesta sessão.
          </li>
        ) : (
          alerts.map((a) => (
            <AlertRow key={a.alertId} alert={a} onClick={setOpen} />
          ))
        )}
      </ul>

      {open && <AlertDetail alert={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function AlertDetail({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="Detalhe do alerta"
      className="fixed inset-0 z-30 grid place-items-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel w-full max-w-md space-y-3 p-5"
      >
        <header className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <SeverityDot severity={alert.severity} size="md" withRing />
            <span className="font-mono text-sm text-fg">{alert.equipmentId}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded p-1 text-fg-muted hover:bg-card-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X size={16} />
          </button>
        </header>
        <p className="text-sm text-fg-body">{alert.message}</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <dt className="text-fg-muted">Severidade</dt>
          <dd className="font-mono text-fg">{alert.severity}</dd>
          <dt className="text-fg-muted">Regra</dt>
          <dd className="font-mono text-fg">{alert.metricName}</dd>
          <dt className="text-fg-muted">Valor atual</dt>
          <dd className="font-mono text-fg">{alert.currentValue.toFixed(2)}</dd>
          <dt className="text-fg-muted">Limite</dt>
          <dd className="font-mono text-fg">{alert.thresholdValue.toFixed(2)}</dd>
          <dt className="text-fg-muted">Quando</dt>
          <dd className="text-fg">
            <RelativeTime iso={alert.timestamp} refreshMs={1000} />
          </dd>
          <dt className="text-fg-muted">ID</dt>
          <dd className="truncate font-mono text-[0.6875rem] text-fg-muted">
            {alert.alertId}
          </dd>
        </dl>
      </div>
    </div>
  );
}
