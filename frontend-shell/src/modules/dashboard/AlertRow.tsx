'use client';

import { SeverityDot } from '@/components/dashboard/SeverityDot';
import { RelativeTime } from '@/components/dashboard/RelativeTime';
import type { Alert } from '@/types/alert';

interface AlertRowProps {
  alert: Alert;
  onClick?: (a: Alert) => void;
}

export function AlertRow({ alert, onClick }: AlertRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onClick?.(alert)}
        className="group flex w-full items-start gap-3 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <SeverityDot severity={alert.severity} withRing />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-mono text-xs text-fg">
              {alert.equipmentId}
            </span>
            <span className="shrink-0 text-[0.6875rem] uppercase tracking-wider text-fg-muted">
              <RelativeTime iso={alert.timestamp} />
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-fg-body">
            <span className="font-semibold">{alert.metricName}</span>:{' '}
            {alert.currentValue.toFixed(1)} (limite {alert.thresholdValue.toFixed(1)})
          </p>
        </div>
      </button>
    </li>
  );
}
