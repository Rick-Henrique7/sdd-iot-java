'use client';

import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';
import {
  OpenMeteoError,
  fetchCurrentWeather,
  type CurrentWeather,
} from '@/lib/weatherApi';

const REFRESH_MS = 10 * 60 * 1000;

interface OpenMeteoWidgetProps {
  lat: number;
  lng: number;
}

export function OpenMeteoWidget({ lat, lng }: OpenMeteoWidgetProps) {
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'ready'; data: CurrentWeather }
    | { kind: 'error'; message: string }
  >({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const load = async () => {
      try {
        const data = await fetchCurrentWeather(lat, lng, controller.signal);
        if (!cancelled) setState({ kind: 'ready', data });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof DOMException && e.name === 'AbortError') return;
        const message =
          e instanceof OpenMeteoError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'falha desconhecida';
        setState({ kind: 'error', message });
      }
    };
    void load();
    const t = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(t);
    };
  }, [lat, lng]);

  return (
    <div className="panel flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 text-xs">
      <header className="flex shrink-0 items-baseline gap-3">
        <span className="text-h2 uppercase tracking-[0.12em] text-fg-muted">
          Clima agora
        </span>
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noreferrer"
          className="text-[0.6875rem] uppercase tracking-wider text-fg-muted hover:text-fg"
        >
          Open-Meteo
        </a>
      </header>
      {state.kind === 'loading' && (
        <p className="text-fg-muted">Carregando…</p>
      )}
      {state.kind === 'error' && (
        <p className="text-fg-muted">Clima indisponível.</p>
      )}
      {state.kind === 'ready' && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-[repeat(3,minmax(0,1fr))] sm:gap-4 md:gap-6">
          <Metric icon={<Cloud size={14} />} label="Temp" value={`${state.data.temperatureC.toFixed(1)}°C`} />
          <Metric icon={<Wind size={14} />} label="Vento" value={`${state.data.windKmh.toFixed(1)} km/h`} />
          <Metric icon={<Droplets size={14} />} label="Chuva" value={`${state.data.precipitationMm.toFixed(1)} mm`} />
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5 rounded-md bg-card-2 px-2 py-1.5">
      <span className="inline-flex items-center gap-1 text-[0.6875rem] uppercase tracking-wider text-fg-muted">
        {icon}
        {label}
      </span>
      <span className="font-mono text-fg">{value}</span>
    </div>
  );
}
