import { create } from 'zustand';
import type { Alert } from '@/types/alert';
import type { TelemetryEvent } from '@/types/telemetry';

/**
 * In-memory live store fed by the STOMP HOC (`withTelemetryStream`).
 *
 * - `telemetry` is keyed by equipmentId. Each value is a *rolling
 *   window* of the most recent events (capped at 120 entries
 *   ~ 2 min at 1 Hz). The HOC flushes into this store at most
 *   once per second; the chart module reads with
 *   `useSyncExternalStore` for tearing-free updates.
 * - `alerts` is the rolling feed (capped at 50, newest first).
 * - The store deliberately does **not** persist anything: this is
 *   a live view, not history. History is fetched via HTTP when
 *   needed.
 */

const MAX_TELEMETRY_PER_EQUIPMENT = 120;
const MAX_ALERTS = 50;

interface TelemetryState {
  telemetry: Record<string, TelemetryEvent[]>;
  alerts: Alert[];
  /** Called by the HOC every debounce tick. */
  pushTelemetry: (events: TelemetryEvent[]) => void;
  /** Called by the HOC on every alert frame (no debounce). */
  pushAlert: (alert: Alert) => void;
  /** Drops everything — used on logout and on `clear()`. */
  clear: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  telemetry: {},
  alerts: [],

  pushTelemetry: (events) => {
    if (events.length === 0) return;
    set((state) => {
      // Bucket by equipmentId to keep the per-key mutation
      // O(window) rather than O(N total).
      const byEquipment: Record<string, TelemetryEvent[]> = {};
      for (const e of events) {
        if (!byEquipment[e.equipmentId]) byEquipment[e.equipmentId] = [];
        byEquipment[e.equipmentId].push(e);
      }
      const next: Record<string, TelemetryEvent[]> = { ...state.telemetry };
      for (const [id, batch] of Object.entries(byEquipment)) {
        const merged = [...(next[id] ?? []), ...batch];
        if (merged.length > MAX_TELEMETRY_PER_EQUIPMENT) {
          merged.splice(0, merged.length - MAX_TELEMETRY_PER_EQUIPMENT);
        }
        next[id] = merged;
      }
      return { telemetry: next };
    });
  },

  pushAlert: (alert) => {
    set((state) => {
      const next = [alert, ...state.alerts];
      if (next.length > MAX_ALERTS) next.length = MAX_ALERTS;
      return { alerts: next };
    });
  },

  clear: () => set({ telemetry: {}, alerts: [] }),
}));

/**
 * Read-only hooks. The dashboard components should prefer these
 * so they don't re-render on unrelated store changes.
 */
export const useTelemetryAlerts = () =>
  useTelemetryStore((s) => s.alerts);

export const useTelemetryFor = (equipmentId: string | null) =>
  useTelemetryStore((s) =>
    equipmentId ? s.telemetry[equipmentId] ?? [] : [],
  );
