'use client';

import { memo, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatmapLayer } from './HeatmapLayer';
import { FieldPlotLayer } from './FieldPlotLayer';
import { TractorMarker } from './TractorMarker';
import type { FieldPlot } from '@/lib/fieldPlots';
import type { HeatmapPoint } from '@/hooks/useHeatmap';
import type { EnrichedEquipment } from './enrichFleetForMap';

interface MapShellProps {
  center: [number, number];
  zoom: number;
  equipment: EnrichedEquipment[];
  fieldPlot: FieldPlot | null;
  heat: HeatmapPoint[] | null;
}

function MapShellImpl({ center, zoom, equipment, fieldPlot, heat }: MapShellProps) {
  const plot = useMemo(() => fieldPlot, [fieldPlot]);
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: '#0F172A' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {plot && <FieldPlotLayer plot={plot} />}
      {heat && heat.length > 0 && <HeatmapLayer points={heat} />}
      {equipment.map((e) => (
        <TractorMarker
          key={e.id}
          equipmentId={e.id}
          status={e.status}
          position={e.latestGps ?? center}
          name={e.name}
          type={e.type}
        />
      ))}
    </MapContainer>
  );
}

export const MapShell = memo(MapShellImpl);
