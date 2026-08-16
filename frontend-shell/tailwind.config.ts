import type { Config } from 'tailwindcss';

/**
 * Brand palette lifted from docs/frontend/blueprint.md.
 * Anything outside these tokens is a code review red flag.
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/modules/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/stores/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === Design System tokens (Change 020) ===
        // Single source of truth for the palette. Anything outside
        // these tokens is a code-review red flag.
        bg:      '#0F172A',  // slate-900, dark canvas (NEVER pure black)
        card:    '#1E293B',  // slate-800, card surface
        'card-2':'#172033',  // slightly darker for sub-areas
        border:  '#334155',  // slate-700, 1px hairline
        brand: {
          DEFAULT: '#367C2B',  // John Deere green (primary)
          hover:   '#2D6824',  // darker on :hover
          soft:    '#1F4A19',  // tinted backgrounds
        },
        accent:   '#FFDE00',  // amarelo agricola (brand secondary)
        warning:  '#F59E0B',  // amber-500, mid-severity attention
        critical: '#EF4444',  // red-500, critical alert
        info:     '#3B82F6',  // blue-500, informational
        fg: {
          DEFAULT: '#F8FAFC',  // slate-50, H1 / primary text
          muted:   '#94A3B8',  // slate-400, H2 / labels
          body:    '#CBD5E1',  // slate-300, body copy
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        h1:   ['1.25rem', { lineHeight: '1.4',  fontWeight: '600' }],
        h2:   ['0.875rem',{ lineHeight: '1.4',  fontWeight: '600' }],
        kpi:  ['1.75rem',{ lineHeight: '1.2',  fontWeight: '700' }],
        body: ['0.8125rem',{ lineHeight: '1.5', fontWeight: '400' }],
      },
      boxShadow: {
        'shell-sidebar': '4px 0 12px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
