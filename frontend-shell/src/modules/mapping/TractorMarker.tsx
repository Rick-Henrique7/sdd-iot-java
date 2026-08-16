'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { RelativeTime } from '@/components/dashboard/RelativeTime';
import { useTelemetryStore } from '@/stores/telemetryStore';
import type { EquipmentStatus } from '@/types/equipment';

const STATUS_COLOR: Record<EquipmentStatus, string> = {
  OPERATIONAL: '#367C2B',
  MAINTENANCE: '#FFDE00',
  INACTIVE: '#94A3B8',
};

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  OPERATIONAL: 'Operacional',
  MAINTENANCE: 'Manutenção',
  INACTIVE: 'Inativo',
};

function tempColour(t: number | undefined): string {
  if (t == null) return '#94A3B8';
  if (t >= 100) return '#EF4444';
  if (t >= 95) return '#FFDE00';
  return '#CBD5E1';
}

function buildIcon(status: EquipmentStatus): L.DivIcon {
  const colour = STATUS_COLOR[status];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
         fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" style="color:${colour}">
      <path d="M3 17h2"/>
      <path d="M17 17h2"/>
      <path d="M5 17h14"/>
      <path d="M7 17v-4l3-3h4l3 3v4"/>
      <circle cx="7" cy="19" r="1.5" fill="${colour}"/>
      <circle cx="17" cy="19" r="1.5" fill="${colour}"/>
    </svg>`;
  return L.divIcon({
    className: 'agrio-tractor-marker',
    html: `<div style="display:grid;place-items:center;width:28px;height:28px;border-radius:9999px;background:rgba(15,23,42,0.85);border:1px solid ${colour};box-shadow:0 0 0 1px rgba(0,0,0,0.4);">${svg}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface TractorMarkerProps {
  equipmentId: string;
  status: EquipmentStatus;
  position: [number, number];
  name: string;
  type: string;
}

/**
 * One tractor marker on the map. The popup is live: it reads
 * the latest `telemetryStore` entry for the equipment so the
 * numbers stay in sync with the dashboard.
 */
export function TractorMarker({ equipmentId, status, position, name, type }: TractorMarkerProps) {
  const last = useTelemetryStore((s) => {
    const series = s.telemetry[equipmentId];
    return series && series.length > 0 ? series[series.length - 1] : null;
  });
  const icon = buildIcon(status);
  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="space-y-1 text-xs">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-fg">{equipmentId}</span>
            <span className="uppercase tracking-wider text-fg-muted">{STATUS_LABEL[status]}</span>
          </div>
          <p className="text-fg-body">{name} <span className="text-fg-muted">· {type}</span></p>
          {last ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1">
              <span className="text-fg-muted">Temp</span>
              <span className="text-right font-mono" style={{ color: tempColour(last.metrics.engineTemp) }}>
                {last.metrics.engineTemp.toFixed(1)} °C
              </span>
              <span className="text-fg-muted">RPM</span>
              <span className="text-right font-mono text-fg">{last.metrics.rpm}</span>
              <span className="text-fg-muted">Velocidade</span>
              <span className="text-right font-mono text-fg">{last.metrics.speed.toFixed(1)}</span>
              <span className="text-fg-muted">Combustivel</span>
              <span className="text-right font-mono text-fg">{last.metrics.fuelLevel.toFixed(1)}%</span>
              <span className="text-fg-muted">Ultimo sinal</span>
              <span className="text-right text-fg">
                <RelativeTime iso={last.timestamp} />
              </span>
            </div>
          ) : (
            <p className="pt-1 text-fg-muted">Aguardando telemetria.</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
