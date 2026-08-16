'use client';

import { useMemo, useState } from 'react';
import { useFleet } from '@/hooks/useFleet';
import { useTelemetryStore } from '@/stores/telemetryStore';
import type { Equipment, EquipmentStatus } from '@/types/equipment';
import { RelativeTime } from '@/components/dashboard/RelativeTime';

type SortKey = 'id' | 'status' | 'rpm' | 'temp' | 'speed' | 'fuel' | 'lastSeen';

const STATUS_DOT: Record<EquipmentStatus, string> = {
  OPERATIONAL: 'bg-brand',
  MAINTENANCE: 'bg-accent',
  INACTIVE: 'bg-fg-muted/50',
};

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  OPERATIONAL: 'Operacional',
  MAINTENANCE: 'Manutencao',
  INACTIVE: 'Inativo',
};

function tempColour(t: number): string {
  if (t >= 100) return 'text-critical';
  if (t >= 95) return 'text-accent';
  return 'text-fg';
}

export function FleetTable() {
  const fleetQuery = useFleet();
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const [sort, setSort] = useState<SortKey>('id');

  const rows = useMemo(() => {
    const fleet = fleetQuery.data ?? [];
    return fleet.map((e) => {
      const events = telemetry[e.id] ?? [];
      const last = events[events.length - 1];
      return {
        equipment: e,
        lastSeen: last?.timestamp ?? null,
        rpm: last?.metrics.rpm ?? null,
        temp: last?.metrics.engineTemp ?? null,
        speed: last?.metrics.speed ?? null,
        fuel: last?.metrics.fuelLevel ?? null,
      } satisfies Row;
    });
  }, [fleetQuery.data, telemetry]);

  const sorted = useMemo(() => {
    const copy = rows.slice();
    copy.sort((a, b) => {
      switch (sort) {
        case 'id':
          return a.equipment.id.localeCompare(b.equipment.id);
        case 'status':
          return a.equipment.status.localeCompare(b.equipment.status);
        case 'rpm':
          return (b.rpm ?? -1) - (a.rpm ?? -1);
        case 'temp':
          return (b.temp ?? -1) - (a.temp ?? -1);
        case 'speed':
          return (b.speed ?? -1) - (a.speed ?? -1);
        case 'fuel':
          return (b.fuel ?? -1) - (a.fuel ?? -1);
        case 'lastSeen':
          return (Date.parse(b.lastSeen ?? '') || 0) - (Date.parse(a.lastSeen ?? '') || 0);
      }
    });
    return copy;
  }, [rows, sort]);

  return (
    <div className="panel p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-h2 uppercase tracking-wider text-fg-muted">
          Frota
        </h2>
        <span className="text-xs text-fg-muted">
          {fleetQuery.isLoading
            ? 'carregando…'
            : `${rows.length} equipamentos`}
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[0.6875rem] uppercase tracking-wider text-fg-muted">
            <tr>
              <Th sortKey="id" sort={sort} onSort={setSort}>ID</Th>
              <Th sortKey="status" sort={sort} onSort={setSort}>Status</Th>
              <Th sortKey="rpm" sort={sort} onSort={setSort} align="right">RPM</Th>
              <Th sortKey="temp" sort={sort} onSort={setSort} align="right">Temp (°C)</Th>
              <Th sortKey="speed" sort={sort} onSort={setSort} align="right">Velocidade</Th>
              <Th sortKey="fuel" sort={sort} onSort={setSort} align="right">Combustivel</Th>
              <Th sortKey="lastSeen" sort={sort} onSort={setSort}>Ultimo sinal</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 && !fleetQuery.isLoading ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-xs text-fg-muted">
                  Nenhum equipamento cadastrado.
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.equipment.id} className="text-fg-body">
                  <td className="py-2 pr-2 font-mono text-xs text-fg">
                    {r.equipment.id}
                  </td>
                  <td className="py-2 pr-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[r.equipment.status]}`}
                      />
                      <span className="text-xs">
                        {STATUS_LABEL[r.equipment.status]}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-right font-mono text-xs">
                    {r.rpm != null ? r.rpm : '—'}
                  </td>
                  <td
                    className={`py-2 pr-2 text-right font-mono text-xs ${tempColour(r.temp ?? 0)}`}
                  >
                    {r.temp != null ? r.temp.toFixed(1) : '—'}
                  </td>
                  <td className="py-2 pr-2 text-right font-mono text-xs">
                    {r.speed != null ? r.speed.toFixed(1) : '—'}
                  </td>
                  <td className="py-2 pr-2 text-right font-mono text-xs">
                    {r.fuel != null ? r.fuel.toFixed(1) : '—'}
                  </td>
                  <td className="py-2 pr-2 text-xs text-fg-muted">
                    {r.lastSeen ? <RelativeTime iso={r.lastSeen} /> : '—'}
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

interface Row {
  equipment: Equipment;
  lastSeen: string | null;
  rpm: number | null;
  temp: number | null;
  speed: number | null;
  fuel: number | null;
}

interface ThProps {
  children: React.ReactNode;
  sortKey: SortKey;
  sort: SortKey;
  onSort: (k: SortKey) => void;
  align?: 'right';
}

function Th({ children, sortKey, sort, onSort, align }: ThProps) {
  const active = sort === sortKey;
  return (
    <th
      scope="col"
      className={`pb-2 ${align === 'right' ? 'text-right' : 'text-left'} pr-2`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 transition-colors ${
          active ? 'text-fg' : 'hover:text-fg'
        }`}
      >
        {children}
        {active && <span aria-hidden>•</span>}
      </button>
    </th>
  );
}
