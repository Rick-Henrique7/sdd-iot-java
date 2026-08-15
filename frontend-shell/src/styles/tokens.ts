/**
 * Brand tokens, mirrored from tailwind.config.ts.
 * Use these when you need the raw value (e.g. in chart libraries
 * that don't speak Tailwind). Don't define new colours here
 * without updating the Tailwind config first.
 */
export const colors = {
  bg:      '#0F172A',
  card:    '#1E293B',
  card2:   '#172033',
  border:  '#334155',
  brand:   '#367C2B',
  brandHover: '#2D6824',
  accent:  '#FFDE00',
  critical:'#EF4444',
  info:    '#3B82F6',
  fg:      '#F8FAFC',
  fgMuted: '#94A3B8',
  fgBody:  '#CBD5E1',
} as const;

export const fonts = {
  sans: 'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;
