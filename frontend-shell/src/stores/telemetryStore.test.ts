import { describe, it, expect, beforeEach } from 'vitest';
import { useTelemetryStore } from './telemetryStore';
import type { TelemetryEvent } from '@/types/telemetry';
import type { Alert } from '@/types/alert';

function evt(equipmentId: string, ts: string, temp = 80, rpm = 1500): TelemetryEvent {
  return {
    equipmentId,
    timestamp: ts,
    gps: { latitude: 0, longitude: 0 },
    metrics: { engineTemp: temp, rpm, fuelLevel: 50, speed: 10 },
  };
}

function alert(over: Partial<Alert> = {}): Alert {
  return {
    alertId: 'a-1',
    equipmentId: 'TRAC-7230J-001',
    severity: 'CRITICAL',
    metricName: 'engineTemp',
    currentValue: 102,
    thresholdValue: 100,
    message: 'too hot',
    timestamp: '2026-08-15T18:00:00Z',
    ...over,
  };
}

describe('telemetryStore', () => {
  beforeEach(() => {
    useTelemetryStore.getState().clear();
  });

  it('starts empty', () => {
    const s = useTelemetryStore.getState();
    expect(s.telemetry).toEqual({});
    expect(s.alerts).toEqual([]);
  });

  it('pushTelemetry buckets by equipmentId', () => {
    useTelemetryStore.getState().pushTelemetry([
      evt('TRAC-1', '2026-08-15T18:00:00Z', 80),
      evt('TRAC-2', '2026-08-15T18:00:00Z', 90),
      evt('TRAC-1', '2026-08-15T18:00:01Z', 81),
    ]);
    const s = useTelemetryStore.getState();
    expect(s.telemetry['TRAC-1']).toHaveLength(2);
    expect(s.telemetry['TRAC-2']).toHaveLength(1);
    expect(s.telemetry['TRAC-1'][1].metrics.engineTemp).toBe(81);
  });

  it('pushTelemetry no-ops on empty array', () => {
    useTelemetryStore.getState().pushTelemetry([]);
    expect(useTelemetryStore.getState().telemetry).toEqual({});
  });

  it('pushTelemetry caps the rolling window per equipment', () => {
    // The cap is 120. Push 130 events for one equipment and
    // verify only the newest 120 are kept.
    const batch = Array.from({ length: 130 }, (_, i) =>
      evt('TRAC-1', new Date(2026, 0, 1, 0, 0, i).toISOString(), 80 + i),
    );
    useTelemetryStore.getState().pushTelemetry(batch);
    const series = useTelemetryStore.getState().telemetry['TRAC-1'];
    expect(series).toHaveLength(120);
    // The first retained event should be the 11th pushed.
    expect(series[0].metrics.engineTemp).toBe(80 + 10);
    expect(series[119].metrics.engineTemp).toBe(80 + 129);
  });

  it('pushAlert prepends and caps at 50', () => {
    for (let i = 0; i < 60; i++) {
      useTelemetryStore.getState().pushAlert(alert({ alertId: `a-${i}` }));
    }
    const s = useTelemetryStore.getState();
    expect(s.alerts).toHaveLength(50);
    expect(s.alerts[0].alertId).toBe('a-59');
    expect(s.alerts[49].alertId).toBe('a-10');
  });

  it('clear drops both telemetry and alerts', () => {
    useTelemetryStore.getState().pushTelemetry([evt('TRAC-1', '2026-08-15T18:00:00Z')]);
    useTelemetryStore.getState().pushAlert(alert());
    useTelemetryStore.getState().clear();
    expect(useTelemetryStore.getState().telemetry).toEqual({});
    expect(useTelemetryStore.getState().alerts).toEqual([]);
  });
});
