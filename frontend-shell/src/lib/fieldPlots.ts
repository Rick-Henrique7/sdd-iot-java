/**
 * Small static seed list of field plots used by the mapping page.
 * The backend has a `FieldPlot` entity but doesn't expose it via
 * a public endpoint yet; this seed is enough to give the operator
 * visual context for the heatmap.
 */
export interface FieldPlotPoint {
  latitude: number;
  longitude: number;
}

export interface FieldPlot {
  id: string;
  name: string;
  center: FieldPlotPoint;
  /** Closed ring (first and last point expected to coincide). */
  polygon: FieldPlotPoint[];
}

export const FIELD_PLOTS: FieldPlot[] = [
  {
    id: 'FLD-01',
    name: 'Talhão 01 — Soja',
    center: { latitude: -22.005, longitude: -47.005 },
    polygon: [
      { latitude: -22.000, longitude: -47.010 },
      { latitude: -22.000, longitude: -47.000 },
      { latitude: -22.010, longitude: -47.000 },
      { latitude: -22.010, longitude: -47.010 },
      { latitude: -22.000, longitude: -47.010 },
    ],
  },
  {
    id: 'FLD-02',
    name: 'Talhão 02 — Milho',
    center: { latitude: -22.025, longitude: -47.025 },
    polygon: [
      { latitude: -22.020, longitude: -47.030 },
      { latitude: -22.020, longitude: -47.020 },
      { latitude: -22.030, longitude: -47.020 },
      { latitude: -22.030, longitude: -47.030 },
      { latitude: -22.020, longitude: -47.030 },
    ],
  },
  {
    id: 'FLD-03',
    name: 'Talhão 03 — Cana',
    center: { latitude: -21.985, longitude: -46.985 },
    polygon: [
      { latitude: -21.980, longitude: -46.990 },
      { latitude: -21.980, longitude: -46.980 },
      { latitude: -21.990, longitude: -46.980 },
      { latitude: -21.990, longitude: -46.990 },
      { latitude: -21.980, longitude: -46.990 },
    ],
  },
];

export const DEFAULT_FIELD_ID = FIELD_PLOTS[0].id;
