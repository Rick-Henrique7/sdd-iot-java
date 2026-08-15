/**
 * Pure telemetry generator. Knows nothing about Kafka, IO or the
 * network — easy to unit-test.
 *
 * Each call to `next(machine)` mutates the machine's `baseLat` /
 * `baseLng` by a small random delta and returns one wire payload.
 *
 * The shape of `TelemetryPayload` mirrors the JSON contract on the
 * `agri.telemetry.raw` topic. The Java side parses it with Jackson
 * and ignores unknown fields, so the contract is the only thing
 * that crosses the Kafka boundary.
 */

export interface Machine {
  /** Stable equipment ID used as the Kafka key. */
  readonly id: string;
  /** Mutable base coordinate. Updated on each `next()` call. */
  baseLat: number;
  baseLng: number;
  /** Optional human-readable type, e.g. "TRATOR". */
  type?: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Metrics {
  engineTemp: number;
  rpm: number;
  fuelLevel: number;
  speed: number;
}

export interface TelemetryPayload {
  equipmentId: string;
  timestamp: string;
  gps: GeoPoint;
  metrics: Metrics;
}

/** Defaults match the spec. */
const DEFAULT_ANOMALY_RATE = 0.05;
/** Max absolute coordinate delta per emission. */
const GPS_STEP_DEG = 0.0001;

const NORMAL_TEMP_MIN = 85.0;
const NORMAL_TEMP_MAX = 90.0;
const ANOMALY_TEMP = 97.8;

const RPM_MIN = 1800;
const RPM_MAX = 2200;
const ANOMALY_RPM = 2700;

const FUEL_MIN = 70.0;
const FUEL_MAX = 90.0;

const SPEED_MIN = 12.0;
const SPEED_MAX = 16.0;

/**
 * Tiny pluggable RNG. Default uses Math.random; tests can pass a
 * deterministic one (e.g. mulberry32) for repeatability.
 */
export type Rng = () => number;

const defaultRng: Rng = () => Math.random();

/** Mulberry32 — small, fast, good-enough seeded PRNG. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GeneratorOptions {
  seed?: number;
  anomalyRate?: number;
  rng?: Rng;
}

export class TelemetryGenerator {
  private readonly rng: Rng;
  private readonly anomalyRate: number;
  private readonly machines: Machine[];

  constructor(options: GeneratorOptions = {}) {
    this.rng = options.rng ?? (options.seed !== undefined
      ? mulberry32(options.seed)
      : defaultRng);
    this.anomalyRate = options.anomalyRate ?? DEFAULT_ANOMALY_RATE;
    this.machines = defaultFleet();
  }

  /** Read-only view of the fleet (3 machines by default). */
  fleet(): ReadonlyArray<Machine> {
    return this.machines;
  }

  /**
   * Emits one payload for the given machine, mutating its base
   * coordinate by a small random step.
   */
  next(machine: Machine): TelemetryPayload {
    machine.baseLat += (this.rng() - 0.5) * 2 * GPS_STEP_DEG;
    machine.baseLng += (this.rng() - 0.5) * 2 * GPS_STEP_DEG;

    const isTempAnomaly = this.rng() < this.anomalyRate;
    const isRpmAnomaly = this.rng() < this.anomalyRate;

    const engineTemp = isTempAnomaly
      ? ANOMALY_TEMP
      : NORMAL_TEMP_MIN + this.rng() * (NORMAL_TEMP_MAX - NORMAL_TEMP_MIN);

    const rpm = isRpmAnomaly
      ? ANOMALY_RPM
      : Math.floor(RPM_MIN + this.rng() * (RPM_MAX - RPM_MIN));

    const fuelLevel = FUEL_MIN + this.rng() * (FUEL_MAX - FUEL_MIN);
    const speed = SPEED_MIN + this.rng() * (SPEED_MAX - SPEED_MIN);

    return {
      equipmentId: machine.id,
      timestamp: new Date().toISOString(),
      gps: {
        latitude: round6(machine.baseLat),
        longitude: round6(machine.baseLng),
      },
      metrics: {
        engineTemp: round1(engineTemp),
        rpm,
        fuelLevel: round1(fuelLevel),
        speed: round1(speed),
      },
    };
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000;
}

function defaultFleet(): Machine[] {
  return [
    { id: 'TRAC-7230J-001', baseLat: -21.1704, baseLng: -47.8103, type: 'TRACTOR' },
    { id: 'TRAC-7230J-002', baseLat: -21.1810, baseLng: -47.8210, type: 'TRACTOR' },
    { id: 'COMB-S790-001', baseLat: -21.1920, baseLng: -47.8300, type: 'HARVESTER' },
  ];
}
