import type { Equipment, EquipmentStatus } from '@/types/equipment';

export interface EnrichedEquipment {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  latestGps?: [number, number];
}

/**
 * Helper to turn the fleet + live telemetry into the map shape.
 * Lives in its own file so the `MapShell` (which imports
 * `react-leaflet`, Leaflet CSS, and `leaflet.heat`) can be
 * loaded with `next/dynamic({ ssr: false })` without dragging
 * its client-only deps into the server bundle.
 */
export function enrichFleetForMap(
  fleet: Equipment[] | undefined,
  latestGps: Record<string, [number, number]>,
): EnrichedEquipment[] {
  if (!fleet) return [];
  return fleet.map((e) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    status: e.status,
    latestGps: latestGps[e.id],
  }));
}
