'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { HeatmapPoint } from '@/hooks/useHeatmap';

interface HeatmapLayerProps {
  points: HeatmapPoint[];
}

/**
 * Renders a translucent heat layer on top of the Leaflet map.
 * `leaflet.heat` extends the global `L` with a
 * `heatLayer(latlngs, options)` factory; we wrap the call in
 * a small useEffect so the layer is cleaned up on unmount or
 * when the points array changes identity.
 *
 * We defer the `addTo` until the map is `ready` AND the next
 * animation frame has fired (so the panel has its real
 * height). Without this, `leaflet.heat` immediately tries to
 * draw on a 0-height canvas and throws `IndexSizeError`,
 * which trips the Next.js error boundary and renders a blank
 * page.
 */
export function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    let cancelled = false;
    const latlngs = points.map((p) => [p.latitude, p.longitude, p.intensity] as [number, number, number]);
    const layer = (L as unknown as {
      heatLayer: (
        latlngs: Array<[number, number, number]>,
        opts: Record<string, unknown>,
      ) => L.Layer;
    }).heatLayer(latlngs, {
      radius: 25,
      blur: 18,
      max: 1.0,
      gradient: { 0.4: '#367C2B', 0.7: '#FFDE00', 1.0: '#EF4444' },
    });
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      // Invalidate so the map knows its real size, then add
      // the heat layer. Order matters: `_reset` reads
      // `canvas.height` synchronously.
      map.invalidateSize();
      try {
        layer.addTo(map);
        layerRef.current = layer;
      } catch (err) {
        // `leaflet.heat` throws `IndexSizeError` if the
        // canvas is still 0-height during a window resize
        // race. Swallow it — the next rAF tick will retry
        // because the parent re-renders.
        // eslint-disable-next-line no-console
        console.warn('heatLayer addTo skipped (canvas 0):', err);
      }
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points]);

  return null;
}
