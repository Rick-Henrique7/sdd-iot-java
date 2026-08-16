'use client';

import { useEffect, useState } from 'react';

interface RelativeTimeProps {
  /** ISO-8601 instant. */
  iso: string;
  /** Refresh interval in ms. Default 5 s — enough granularity
   *  for "hace 12 s" style strings without thrashing. */
  refreshMs?: number;
}

/**
 * Renders a human-friendly "hace 12 s" / "hace 3 min" string
 * that refreshes itself every `refreshMs` so the dashboard
 * doesn't show stale times.
 */
export function RelativeTime({ iso, refreshMs = 5_000 }: RelativeTimeProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), refreshMs);
    return () => window.clearInterval(t);
  }, [refreshMs]);

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return <span className="text-fg-muted">—</span>;
  }
  const diff = Date.now() - then;
  if (diff < 0) return <span>agora</span>;
  return <span>{formatRelative(diff)}</span>;
}

function formatRelative(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 5) return 'agora';
  if (s < 60) return `hace ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}
