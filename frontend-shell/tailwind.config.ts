import type { Config } from 'tailwindcss';

/**
 * Brand palette lifted from docs/frontend/blueprint.md.
 * Anything outside these tokens is a code review red flag.
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:      '#0F172A',  // slate-900, dark canvas
        card:    '#1E293B',  // slate-800, card surface
        'card-2':'#172033',  // slightly darker for sub-areas
        border:  '#334155',  // slate-700
        brand: {
          DEFAULT: '#367C2B',  // John Deere green
          hover:   '#2D6824',
          soft:    '#1F4A19',
        },
        accent:   '#FFDE00',  // amarelo agricola
        critical: '#EF4444',
        info:     '#3B82F6',
        fg: {
          DEFAULT: '#F8FAFC',  // H1
          muted:   '#94A3B8',  // H2
          body:    '#CBD5E1',  // body
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
