/** Single source of truth for app route paths. */
export const routes = {
  root:               '/',
  login:              '/login',
  register:           '/register',
  dashboard:          '/dashboard',
  mapping:            '/mapping',
  fleet:              '/fleet',
  settings:           '/settings',
  // NEW in Change 021 — Gestor-only sidebars.
  operations:         '/operations',
  maintenance:        '/maintenance',
  // Operator workspace — dedicated route, no sidebar (Change 020).
  operatorWorkspace:  '/operator/workspace',
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];
