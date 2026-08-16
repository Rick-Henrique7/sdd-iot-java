'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { useFleet } from '@/hooks/useFleet';
import { useHeatmap } from '@/hooks/useHeatmap';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { DEFAULT_FIELD_ID, FIELD_PLOTS } from '@/lib/fieldPlots';
import { Switch } from '@/components/ui/Switch';
import { FieldPicker } from './FieldPicker';
import { OpenMeteoWidget } from './OpenMeteoWidget';
import { enrichFleetForMap } from './enrichFleetForMap';

const MapShellDynamic = dynamic(
  () => import('./MapShell').then((m) => m.MapShell),
  { ssr: false, loading: () => <div className="grid h-full place-items-center text-fg-muted">Carregando mapa…</div> },
);

export function Mapping() {
  const [fieldId, setFieldId] = useState<string>(DEFAULT_FIELD_ID);
  const [showHeat, setShowHeat] = useState(true);

  const fleetQuery = useFleet();
  const heatQuery = useHeatmap(showHeat ? fieldId : null);
  const telemetry = useTelemetryStore((s) => s.telemetry);

  const latestGps = useMemo<Record<string, [number, number]>>(() => {
    const out: Record<string, [number, number]> = {};
    for (const [id, series] of Object.entries(telemetry)) {
      const last = series[series.length - 1];
      if (last) out[id] = [last.gps.latitude, last.gps.longitude];
    }
    return out;
  }, [telemetry]);

  const enriched = useMemo(
    () => enrichFleetForMap(fleetQuery.data, latestGps),
    [fleetQuery.data, latestGps],
  );

  const plot = useMemo(
    () => FIELD_PLOTS.find((p) => p.id === fieldId) ?? FIELD_PLOTS[0],
    [fieldId],
  );
  const center: [number, number] = [plot.center.latitude, plot.center.longitude];

  return (
    <section className="animate-fade-in space-y-4">
      <header className="space-y-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <MapIcon size={12} aria-hidden />
          Change 009
        </span>
        <h1 className="text-h1 font-semibold text-fg">Mapeamento de Campo</h1>
        <p className="text-sm text-fg-muted">
          Visualizacao geografica em tempo real com Leaflet, heatmap de pulverizacao e widget de clima Open-Meteo.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_16rem]">
        <div className="panel flex h-[60vh] flex-col overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-3">
            <div className="w-56">
              <FieldPicker value={fieldId} onChange={setFieldId} />
            </div>
            <Switch
              label="Heatmap"
              checked={showHeat}
              onChange={(e) => setShowHeat(e.currentTarget.checked)}
            />
          </div>
          <div className="relative flex-1">
            <MapShellDynamic
              center={center}
              zoom={13}
              equipment={enriched}
              fieldPlot={plot}
              heat={showHeat ? heatQuery.data ?? null : null}
            />
            <div className="pointer-events-none absolute right-3 top-3">
              <OpenMeteoWidget lat={center[0]} lng={center[1]} />
            </div>
          </div>
          <footer className="flex items-center gap-4 border-t border-border px-3 py-2 text-[0.6875rem] uppercase tracking-wider text-fg-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" /> Operacional
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Manutencao
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-fg-muted/50" /> Inativo
            </span>
            <span className="ml-auto">{enriched.length} equipamentos</span>
          </footer>
        </div>

        <div className="space-y-4">
          <div className="panel space-y-2 p-4">
            <h2 className="text-h2 uppercase tracking-wider text-fg-muted">Talhão selecionado</h2>
            <p className="text-sm text-fg">{plot.name}</p>
            <p className="text-xs text-fg-muted">
              Centro em ({plot.center.latitude.toFixed(3)}, {plot.center.longitude.toFixed(3)}).{' '}
              {plot.polygon.length - 1} vertices.
            </p>
          </div>
          <div className="panel space-y-2 p-4">
            <h2 className="text-h2 uppercase tracking-wider text-fg-muted">Heatmap</h2>
            <p className="text-xs text-fg-muted">
              {showHeat
                ? heatQuery.isLoading
                  ? 'Carregando…'
                  : `${heatQuery.data?.length ?? 0} pontos para ${fieldId}.`
                : 'Camada oculta.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
