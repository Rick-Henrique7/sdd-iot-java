'use client';

import { Truck } from 'lucide-react';
import { useFleet } from '@/hooks/useFleet';
import type { Equipment, EquipmentStatus } from '@/types/equipment';

const STATUS_DOT: Record<EquipmentStatus, string> = {
  OPERATIONAL: 'bg-brand',
  MAINTENANCE: 'bg-accent',
  INACTIVE: 'bg-fg-muted/50',
};

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  OPERATIONAL: 'Operacional',
  MAINTENANCE: 'Manutenção',
  INACTIVE: 'Inativo',
};

interface FleetTableProps {
  /** Equipment to mark for edit (row action). */
  onEdit: (e: Equipment) => void;
  /** Equipment to mark for status toggle. */
  onToggleStatus: (e: Equipment) => void;
  /** Disable both action buttons (e.g. while a request is in flight). */
  actionsDisabled?: boolean;
}

export function FleetTable({ onEdit, onToggleStatus, actionsDisabled }: FleetTableProps) {
  const fleetQuery = useFleet();
  const rows = fleetQuery.data ?? [];

  return (
    <div className="panel p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-fg-muted" aria-hidden />
          <h2 className="text-h2 uppercase tracking-wider text-fg-muted">Equipamentos</h2>
        </div>
        <span className="text-xs text-fg-muted">
          {fleetQuery.isLoading ? 'carregando…' : `${rows.length} cadastrados`}
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[0.6875rem] uppercase tracking-wider text-fg-muted">
            <tr>
              <th className="pb-2 pr-2 text-left">ID</th>
              <th className="pb-2 pr-2 text-left">Nome</th>
              <th className="pb-2 pr-2 text-left">Modelo</th>
              <th className="pb-2 pr-2 text-left">Tipo</th>
              <th className="pb-2 pr-2 text-left">Status</th>
              <th className="pb-2 pr-2 text-right">Horimetro</th>
              <th className="pb-2 pr-2 text-left">Última manutenção</th>
              <th className="pb-2 pr-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && !fleetQuery.isLoading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-xs text-fg-muted">
                  Nenhum equipamento cadastrado.
                </td>
              </tr>
            ) : (
              rows.map((e) => (
                <tr key={e.id} className="text-fg-body">
                  <td className="py-2 pr-2 font-mono text-xs text-fg">{e.id}</td>
                  <td className="py-2 pr-2 text-xs">{e.name}</td>
                  <td className="py-2 pr-2 font-mono text-xs">{e.model}</td>
                  <td className="py-2 pr-2 text-xs">{e.type}</td>
                  <td className="py-2 pr-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[e.status]}`}
                      />
                      <span className="text-xs">{STATUS_LABEL[e.status]}</span>
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-right font-mono text-xs">
                    {e.horometerHours.toFixed(1)}
                  </td>
                  <td className="py-2 pr-2 text-xs text-fg-muted">
                    {e.lastMaintenanceDate ?? '—'}
                  </td>
                  <td className="py-2 pr-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(e)}
                        disabled={actionsDisabled}
                        className="rounded border border-border bg-card px-2 py-1 text-[0.6875rem] uppercase tracking-wider text-fg-muted transition-colors hover:border-brand hover:text-fg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(e)}
                        disabled={actionsDisabled}
                        className="rounded border border-border bg-card px-2 py-1 text-[0.6875rem] uppercase tracking-wider text-fg-muted transition-colors hover:border-accent hover:text-fg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        {e.status === 'INACTIVE' ? 'Reativar' : 'Desativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
