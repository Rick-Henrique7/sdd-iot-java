'use client';

import { useTelemetryAlerts } from '@/stores/telemetryStore';
import type { Alert, AlertSeverity } from '@/types/alert';

/**
 * Live feed of recent alerts from the STOMP store.
 *
 * The store already keeps a rolling 50-alert cap with newest
 * first, so this hook is just a typed read with a derived
 * `countBySeverity` helper for the KPI card.
 */
export function useRecentAlerts() {
  const alerts = useTelemetryAlerts();
  const countBySeverity = alerts.reduce<Record<AlertSeverity, number>>(
    (acc, a) => {
      acc[a.severity] = (acc[a.severity] ?? 0) + 1;
      return acc;
    },
    { INFO: 0, WARNING: 0, CRITICAL: 0 },
  );
  return { alerts, countBySeverity };
}
