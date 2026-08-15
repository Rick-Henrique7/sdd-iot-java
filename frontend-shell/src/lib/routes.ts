/** Single source of truth for app route paths. */
export const routes = {
  root:        '/',
  login:       '/login',
  register:    '/register',
  dashboard:   '/dashboard',
  mapping:     '/mapping',
  fleet:       '/fleet',
  settings:    '/settings',
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];
