'use client';

import { useMemo } from 'react';
import { useFleet } from '@/hooks/useFleet';
import { useRecentAlerts } from '@/hooks/useRecentAlerts';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { useThresholds } from '@/stores/preferencesStore';

/**
 * Derives the three KPI values for the top row of the dashboard.
 *
 * - **Frota Ativa** — distinct equipmentIds seen in the live
 *   store in the last 60 s, divided by the total fleet size.
 * - **Temperatura Media do Motor** — average `engineTemp`
 *   across all live events in the last 5 min. Tone is derived
 *   from the operator's `preferencesStore` thresholds so the
 *   `/settings` page can move the goalposts.
 * - **Alertas Criticos (24 h)** — count of `severity = CRITICAL`
 *   in the live alert feed. (We keep this on the live feed
 *   only — historical alerts aren't exposed in this change.
 *   The window is a soft hint; the spec calls for "24 h" but
 *   the live feed is at most 50 items, so the value is best
 *   read as "since the session started".)
 */
export function useKpis() {
  const fleetQuery = useFleet();
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const { countBySeverity } = useRecentAlerts();
  const thresholds = useThresholds();

  return useMemo(() => {
    const fleet = fleetQuery.data ?? [];
    const total = fleet.length;

    const now = Date.now();
    const SIXTY_S = 60_000;
    const FIVE_MIN = 5 * 60_000;

    const seen = new Set<string>();
    let tempSum = 0;
    let tempCount = 0;
    for (const events of Object.values(telemetry)) {
      for (const e of events) {
        const t = new Date(e.timestamp).getTime();
        if (Number.isNaN(t)) continue;
        if (now - t > FIVE_MIN) continue;
        if (now - t <= SIXTY_S) seen.add(e.equipmentId);
        tempSum += e.metrics.engineTemp;
        tempCount += 1;
      }
    }
    const avgTemp = tempCount > 0 ? tempSum / tempCount : 0;
    const tempState =
      avgTemp === 0
        ? ('idle' as const)
        : avgTemp >= thresholds.engineTempCritical
          ? ('critical' as const)
          : avgTemp >= thresholds.engineTempWarning
            ? ('warning' as const)
            : ('ok' as const);

    return {
      activeFleet: { seen: seen.size, total },
      avgTemp: { value: avgTemp, state: tempState },
      criticalAlerts: countBySeverity.CRITICAL,
      isLoading: fleetQuery.isLoading,
    };
  }, [fleetQuery.data, fleetQuery.isLoading, telemetry, countBySeverity.CRITICAL, thresholds]);
}
