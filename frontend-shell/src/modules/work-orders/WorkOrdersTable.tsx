'use client';

import type { WorkOrderDTO, WorkOrderStatus } from './useWorkOrdersQuery';

const STATUS_STYLES: Record<WorkOrderStatus, { dot: string; label: string }> = {
  PENDING:     { dot: 'bg-accent',   label: 'Pendente' },
  IN_PROGRESS: { dot: 'bg-brand',    label: 'Em curso' },
  PAUSED:      { dot: 'bg-warning',  label: 'Pausada' },
  COMPLETED:   { dot: 'bg-info',     label: 'Concluida' },
  CANCELLED:   { dot: 'bg-fg-muted', label: 'Cancelada' },
};

function shortDate(iso: string): string {
  // Render ISO-8601 as DD/MM HH:mm in local time.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${mi}`;
}

interface WorkOrdersTableProps {
  rows: WorkOrderDTO[];
}

export function WorkOrdersTable({ rows }: WorkOrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-card-2 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <tr>
            <th className="px-4 py-2 text-left font-medium">ID</th>
            <th className="px-4 py-2 text-left font-medium">Equipamento</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
            <th className="px-4 py-2 text-left font-medium">Criada em</th>
            <th className="px-4 py-2 text-left font-medium">Operador</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((wo) => {
            const s = STATUS_STYLES[wo.status];
            return (
              <tr key={wo.id} className="hover:bg-card-2">
                <td className="px-4 py-2 font-mono text-xs text-fg">
                  {wo.id.slice(0, 12)}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-fg">
                  {wo.equipmentId}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-2 text-xs">
                    <span aria-hidden className={`h-2 w-2 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-fg-muted">
                  {shortDate(wo.createdAt)}
                </td>
                <td className="px-4 py-2 font-mono text-xs text-fg-muted">
                  {wo.operatorId}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
