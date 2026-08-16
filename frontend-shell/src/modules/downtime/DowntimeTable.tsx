'use client';

import type { DowntimeDTO } from './useDowntimeQuery';
import { reasonLabel } from './useDowntimeQuery';

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${mi}`;
}

function durationLabel(startIso: string, endIso?: string): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—';
  const mins = Math.round((end - start) / 60_000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

interface DowntimeTableProps {
  rows: DowntimeDTO[];
}

export function DowntimeTable({ rows }: DowntimeTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-card-2 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Equipamento</th>
            <th className="px-4 py-2 text-left font-medium">Motivo</th>
            <th className="px-4 py-2 text-left font-medium">Iniciada em</th>
            <th className="px-4 py-2 text-left font-medium">Encerrada em</th>
            <th className="px-4 py-2 text-left font-medium">Duracao</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((d) => (
            <tr key={d.id} className="hover:bg-card-2">
              <td className="px-4 py-2 font-mono text-xs text-fg">{d.equipmentId}</td>
              <td className="px-4 py-2 text-xs text-fg">{reasonLabel(d.reason)}</td>
              <td className="px-4 py-2 font-mono text-xs text-fg-muted">{shortDate(d.startTime)}</td>
              <td className="px-4 py-2 font-mono text-xs text-fg-muted">
                {d.endTime ? shortDate(d.endTime) : 'em curso'}
              </td>
              <td className="px-4 py-2 font-mono text-xs text-fg">{durationLabel(d.startTime, d.endTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
