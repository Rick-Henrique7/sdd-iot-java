import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  // esbuild settings — `automatic` enables the React 17+ JSX
  // runtime so we don't need `import React from 'react'` in
  // every file (the tsconfig is `preserve` for Next.js, but
  // vitest compiles standalone).
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
