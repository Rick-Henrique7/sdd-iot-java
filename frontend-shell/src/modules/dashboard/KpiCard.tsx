'use client';

import { type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type KpiTone = 'ok' | 'warning' | 'critical' | 'idle';

const TONE_RING: Record<KpiTone, string> = {
  ok: 'ring-brand/30',
  warning: 'ring-accent/40',
  critical: 'ring-critical/40',
  idle: 'ring-border',
};

const TONE_DOT: Record<KpiTone, string> = {
  ok: 'bg-brand',
  warning: 'bg-accent',
  critical: 'bg-critical animate-pulse',
  idle: 'bg-fg-muted/40',
};

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: KpiTone;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'idle',
}: KpiCardProps) {
  return (
    <div
      className={`panel flex h-full flex-col gap-3 p-4 ring-1 ${TONE_RING[tone]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-h2 uppercase tracking-wider text-fg-muted">
          {label}
        </span>
        <span
          className={`grid h-7 w-7 place-items-center rounded-md bg-card-2 ${TONE_DOT[tone]} bg-opacity-20`}
        >
          <Icon size={14} className="text-fg" aria-hidden />
        </span>
      </div>
      <div className="font-mono text-kpi text-fg">{value}</div>
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}
