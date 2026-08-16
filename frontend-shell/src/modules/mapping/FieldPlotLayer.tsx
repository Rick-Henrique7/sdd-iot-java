'use client';

import { Polygon } from 'react-leaflet';
import type { FieldPlot } from '@/lib/fieldPlots';

interface FieldPlotLayerProps {
  plot: FieldPlot;
}

/**
 * Renders a single `FieldPlot` as a Leaflet `<Polygon>` with
 * the brand palette: a `card-2` fill at 30 % opacity, a `brand`
 * stroke at 1 px. Polygons are not interactive in this change.
 */
export function FieldPlotLayer({ plot }: FieldPlotLayerProps) {
  const positions = plot.polygon.map((p) => [p.latitude, p.longitude] as [number, number]);
  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: '#367C2B',
        weight: 1,
        fillColor: '#1E293B',
        fillOpacity: 0.3,
      }}
    />
  );
}
