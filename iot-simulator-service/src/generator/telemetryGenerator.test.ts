import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TelemetryGenerator,
  mulberry32,
  type Machine,
  type TelemetryPayload,
} from './telemetryGenerator';

test('anomaly branch always pushes engineTemp above 95', () => {
  const gen = new TelemetryGenerator({ rng: mulberry32(1) });
  // Force every emission to be a temp anomaly by giving the rng
  // a stream of zeros (rng() < anomalyRate is always true).
  // Mulberry32 with the same seed is deterministic, so we instead
  // override the constructor to use anomalyRate=1.
  const forced = new TelemetryGenerator({ rng: () => 0, anomalyRate: 1 });
  const machines = forced.fleet() as Machine[];
  for (let i = 0; i < 10_000; i++) {
    for (const m of machines) {
      const p = forced.next(m);
      assert.ok(p.metrics.engineTemp > 95,
        `engineTemp=${p.metrics.engineTemp} should be > 95`);
    }
  }
});

test('anomaly branch always pushes rpm above 2500', () => {
  const forced = new TelemetryGenerator({ rng: () => 0, anomalyRate: 1 });
  const machines = forced.fleet() as Machine[];
  for (let i = 0; i < 10_000; i++) {
    for (const m of machines) {
      const p = forced.next(m);
      assert.ok(p.metrics.rpm > 2500,
        `rpm=${p.metrics.rpm} should be > 2500`);
    }
  }
});

test('all emitted payloads respect the wire-format rules', () => {
  const gen = new TelemetryGenerator({ rng: mulberry32(42) });
  const machines = gen.fleet() as Machine[];

  for (let i = 0; i < 1_000; i++) {
    for (const m of machines) {
      const p: TelemetryPayload = gen.next(m);
      assert.match(p.equipmentId, /^[A-Z0-9-]+$/);
      assert.ok(!Number.isNaN(Date.parse(p.timestamp)),
        `timestamp ${p.timestamp} must be ISO-8601`);

      assert.ok(p.gps.latitude >= -90 && p.gps.latitude <= 90,
        `lat=${p.gps.latitude} out of range`);
      assert.ok(p.gps.longitude >= -180 && p.gps.longitude <= 180,
        `lng=${p.gps.longitude} out of range`);

      assert.ok(p.metrics.engineTemp >= 60 && p.metrics.engineTemp <= 120,
        `engineTemp=${p.metrics.engineTemp} out of range`);
      assert.ok(Number.isInteger(p.metrics.rpm),
        `rpm=${p.metrics.rpm} must be integer`);
      assert.ok(p.metrics.rpm >= 0 && p.metrics.rpm <= 4000,
        `rpm=${p.metrics.rpm} out of range`);
      assert.ok(p.metrics.fuelLevel >= 0 && p.metrics.fuelLevel <= 100,
        `fuelLevel=${p.metrics.fuelLevel} out of range`);
      assert.ok(p.metrics.speed >= 0 && p.metrics.speed <= 60,
        `speed=${p.metrics.speed} out of range`);

      // 1-decimal place for the floats (engineTemp, fuelLevel, speed).
      // We accept "85" or "85.0" — both round to the same value at
      // 1-decimal precision, and `String(85.0)` is just "85" in JS.
      assert.ok(decimals(p.metrics.engineTemp) <= 1, 'engineTemp has too many decimals');
      assert.ok(decimals(p.metrics.fuelLevel)  <= 1, 'fuelLevel has too many decimals');
      assert.ok(decimals(p.metrics.speed)      <= 1, 'speed has too many decimals');
    }
  }
});

test('determinism: same seed produces byte-equal first 10 emissions', () => {
  const a = new TelemetryGenerator({ seed: 42 });
  const b = new TelemetryGenerator({ seed: 42 });

  // Walk the same number of steps on both generators' fleets.
  for (let i = 0; i < 10; i++) {
    for (const m of a.fleet() as Machine[]) {
      const pa = a.next(m);
      const pb = b.next(b.fleet()[a.fleet().indexOf(m)] as Machine);
      assert.equal(JSON.stringify(pa), JSON.stringify(pb));
    }
  }
});

function decimals(n: number): number {
  const s = String(n);
  const idx = s.indexOf('.');
  return idx === -1 ? 0 : s.length - idx - 1;
}
