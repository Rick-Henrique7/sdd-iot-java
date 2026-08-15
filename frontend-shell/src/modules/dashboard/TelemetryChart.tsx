'use client';

import { memo, useMemo, useState } from 'react';
import { EquipmentPicker } from '@/components/dashboard/EquipmentPicker';
import { useTelemetryStore } from '@/stores/telemetryStore';
import type { TelemetryEvent } from '@/types/telemetry';

const VIEW_W = 600;
const VIEW_H = 240;
const PAD_L = 36;
const PAD_R = 36;
const PAD_T = 12;
const PAD_B = 24;
const PLOT_W = VIEW_W - PAD_L - PAD_R;
const PLOT_H = VIEW_H - PAD_T - PAD_B;
const WINDOW_S = 60;
const TEMP_MAX = 120;
const RPM_MAX = 4000;

interface Buckets {
  /** x seconds from "now" (0 = rightmost). */
  t: number;
  temp: number | null;
  rpm: number | null;
}

function bucketize(
  events: TelemetryEvent[],
  now: number,
): Buckets[] {
  // Build 60 one-second buckets ending at `now`. Events falling
  // outside the window are dropped. Multi-event buckets are
  // averaged (the spec calls for "averaged within 1 s").
  const out: Buckets[] = Array.from({ length: WINDOW_S }, (_, i) => ({
    t: WINDOW_S - 1 - i,
    temp: null,
    rpm: null,
  }));
  const tSum = new Array<number>(WINDOW_S).fill(0);
  const tCnt = new Array<number>(WINDOW_S).fill(0);
  const rSum = new Array<number>(WINDOW_S).fill(0);
  const rCnt = new Array<number>(WINDOW_S).fill(0);
  for (const e of events) {
    const t = new Date(e.timestamp).getTime();
    if (Number.isNaN(t)) continue;
    const delta = Math.floor((now - t) / 1000);
    if (delta < 0 || delta >= WINDOW_S) continue;
    const i = WINDOW_S - 1 - delta;
    tSum[i] += e.metrics.engineTemp;
    tCnt[i] += 1;
    rSum[i] += e.metrics.rpm;
    rCnt[i] += 1;
  }
  for (let i = 0; i < WINDOW_S; i++) {
    if (tCnt[i] > 0) out[i].temp = tSum[i] / tCnt[i];
    if (rCnt[i] > 0) out[i].rpm = rSum[i] / rCnt[i];
  }
  return out;
}

function tempX(t: number): number {
  // t: seconds from "now" (0 = right edge, 60 = left edge)
  return PAD_L + (1 - t / WINDOW_S) * PLOT_W;
}

function tempY(v: number): number {
  return PAD_T + (1 - Math.min(v, TEMP_MAX) / TEMP_MAX) * PLOT_H;
}

function rpmY(v: number): number {
  return PAD_T + (1 - Math.min(v, RPM_MAX) / RPM_MAX) * PLOT_H;
}

interface TelemetryChartProps {
  selectedId: string | null;
  onChangeSelected: (id: string) => void;
}

function TelemetryChartImpl({ selectedId, onChangeSelected }: TelemetryChartProps) {
  const allTelemetry = useTelemetryStore((s) => s.telemetry);
  const equipmentIds = useMemo(
    () => Object.keys(allTelemetry).sort(),
    [allTelemetry],
  );
  // If the selectedId is no longer present (e.g. it just went
  // silent), fall back to the first available.
  const effectiveId =
    selectedId && allTelemetry[selectedId] ? selectedId : equipmentIds[0] ?? null;
  const events = useMemo(
    () => (effectiveId ? allTelemetry[effectiveId] ?? [] : []),
    [effectiveId, allTelemetry],
  );
  const now = Date.now();
  const buckets = useMemo(() => bucketize(events, now), [events, now]);

  // Build the two polylines. We break the line at missing
  // buckets by using M and a fresh L for each continuous run.
  const tempPath = buildPath(buckets.map((b) => (b.temp == null ? null : tempY(b.temp))));
  const rpmPath  = buildPath(buckets.map((b) => (b.rpm  == null ? null : rpmY(b.rpm ))));

  return (
    <div className="panel flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-h2 uppercase tracking-wider text-fg-muted">
            Telemetria ao vivo
          </h2>
          <p className="text-xs text-fg-muted">
            Temperatura do motor (vermelho) e RPM (verde) — janela de 60 s
          </p>
        </div>
        <div className="w-56">
          <EquipmentPicker
            equipmentIds={equipmentIds}
            value={effectiveId}
            onChange={onChangeSelected}
          />
        </div>
      </div>

      <div className="flex-1">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label="Grafico de telemetria ao vivo"
        >
          {/* Background grid */}
          <rect
            x={PAD_L}
            y={PAD_T}
            width={PLOT_W}
            height={PLOT_H}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.06)"
          />
          {/* Y grid lines (left axis: temp) */}
          {[0, 30, 60, 90, 120].map((v) => (
            <g key={`g-t-${v}`}>
              <line
                x1={PAD_L}
                y1={tempY(v)}
                x2={PAD_L + PLOT_W}
                y2={tempY(v)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="2 4"
              />
              <text
                x={PAD_L - 4}
                y={tempY(v) + 3}
                fontSize="9"
                textAnchor="end"
                fill="rgba(148,163,184,0.7)"
              >
                {v}°C
              </text>
            </g>
          ))}
          {/* Y grid lines (right axis: rpm) */}
          {[0, 1000, 2000, 3000, 4000].map((v) => (
            <g key={`g-r-${v}`}>
              <text
                x={PAD_L + PLOT_W + 4}
                y={rpmY(v) + 3}
                fontSize="9"
                textAnchor="start"
                fill="rgba(148,163,184,0.5)"
              >
                {v}
              </text>
            </g>
          ))}
          {/* X axis labels: every 10 s */}
          {Array.from({ length: 7 }, (_, i) => i * 10).map((s) => (
            <text
              key={`x-${s}`}
              x={tempX(WINDOW_S - s)}
              y={VIEW_H - 6}
              fontSize="9"
              textAnchor="middle"
              fill="rgba(148,163,184,0.7)"
            >
              {`-${s}s`}
            </text>
          ))}

          {/* Lines */}
          {rpmPath && (
            <path
              d={rpmPath}
              fill="none"
              stroke="#367C2B"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {tempPath && (
            <path
              d={tempPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Legend */}
          <g transform={`translate(${PAD_L + 6} ${PAD_T + 4})`}>
            <rect width="6" height="6" fill="#EF4444" />
            <text x="10" y="6" fontSize="9" fill="#CBD5E1">
              Temperatura
            </text>
            <rect x="78" width="6" height="6" fill="#367C2B" />
            <text x="88" y="6" fontSize="9" fill="#CBD5E1">
              RPM
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

function buildPath(points: Array<number | null>): string | null {
  let d = '';
  let pen = false;
  for (let i = 0; i < points.length; i++) {
    const y = points[i];
    if (y == null) {
      pen = false;
      continue;
    }
    const x = tempX(WINDOW_S - 1 - i);
    d += pen ? ` L ${x} ${y}` : `M ${x} ${y}`;
    pen = true;
  }
  return d === '' ? null : d;
}

export const TelemetryChart = memo(TelemetryChartImpl);
