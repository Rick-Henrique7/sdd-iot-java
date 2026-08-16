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
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-sm text-fg-muted">
        Carregando mapa…
      </div>
    ),
  },
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

      if (last) {
        out[id] = [last.gps.latitude, last.gps.longitude];
      }
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

  const center: [number, number] = [
    plot.center.latitude,
    plot.center.longitude,
  ];

  return (
    <section className="animate-fade-in space-y-6">
      {/* Header */}
      <header className="max-w-4xl space-y-3">


        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-fg-muted">
              <MapIcon size={12} strokeWidth={2} aria-hidden />
              <h1 className="text-h2 font-semibold leading-tight tracking-tight text-fg">
                Mapeamento de Campo
              </h1>
            </span>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-fg-muted">
            Visualização geográfica em tempo real com Leaflet, heatmap de
            pulverização e widget de clima Open-Meteo.
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="space-y-4">
        <OpenMeteoWidget lat={center[0]} lng={center[1]} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Map */}
        <div className="panel flex h-[60vh] min-h-[560px] flex-col overflow-hidden">
          {/* Map toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
            <div className="w-full max-w-xs">
              <FieldPicker
                value={fieldId}
                onChange={setFieldId}
              />
            </div>

            <div className="flex flex-col items-end gap-1">
              <Switch
                label="Heatmap"
                checked={showHeat}
                onChange={(e) =>
                  setShowHeat(e.currentTarget.checked)
                }
              />
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-fg-muted">
                {showHeat
                  ? heatQuery.isLoading
                    ? 'Carregando…'
                    : `${heatQuery.data?.length ?? 0} pontos para ${fieldId}.`
                  : 'Camada oculta.'}
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="relative min-h-[420px] flex-1">
            <MapShellDynamic
              center={center}
              zoom={13}
              equipment={enriched}
              fieldPlot={plot}
              heat={showHeat ? heatQuery.data ?? null : null}
            />


          </div>

          {/* Legend */}
          <footer className="flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-border px-5 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-fg-muted">
            <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Operacional
            </span>

            <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Manutenção
            </span>

            <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-fg-muted/50" />
              Inativo
            </span>

            <span className="ml-auto whitespace-nowrap text-fg-muted/80">
              {enriched.length} equipamentos
            </span>
          </footer>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Selected field */}
          <div className="panel space-y-4 p-5">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-fg-muted">
                Talhão selecionado
              </h2>

              <div className="h-px w-8 bg-brand/70" />
            </div>

            <div className="space-y-1.5">
              <p className="text-base font-medium leading-6 text-fg">
                {plot.name}
              </p>

              <p className="text-xs leading-5 text-fg-muted">
                Centro em ({plot.center.latitude.toFixed(3)},{' '}
                {plot.center.longitude.toFixed(3)}).
              </p>

              <p className="text-xs leading-5 text-fg-muted">
                {plot.polygon.length - 1} vértices.
              </p>
            </div>
          </div>

          {/* Heatmap */}
          <div className="panel space-y-4 p-5">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-fg-muted">
                Heatmap
              </h2>

              <div className="h-px w-8 bg-accent/70" />
            </div>

            <div className="min-h-10">
              <p className="text-sm leading-6 text-fg-muted">
                {showHeat
                  ? heatQuery.isLoading
                    ? 'Carregando…'
                    : `${heatQuery.data?.length ?? 0} pontos para ${fieldId}.`
                  : 'Camada oculta.'}
              </p>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </section>
  );
}