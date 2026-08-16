'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { routes } from '@/lib/routes';
import { AppShell } from '@/components/layout/AppShell';
import { TelemetryStreamMount } from '@/components/telemetry/TelemetryStreamMount';

/**
 * Client-side guard for the Gestor/Agrônomo shell (Change 021).
 *
 * - Hydrates the auth store from localStorage on mount.
 * - Redirects to /login if there is no token.
 * - Redirects to /operator/workspace if the user is an Operador
 *   (operators get the dedicated /operator shell, not this one).
 *
 * Also mounts the global STOMP subscription (`TelemetryStreamMount`)
 * once for the entire authenticated area, so the `telemetryStore`
 * and `alertsStore` stay populated while the user navigates
 * between /dashboard, /mapping, /operations, /fleet, /maintenance
 * and /settings.
 */
export default function GestorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem('agrio.token')
      : null;

    if (!token && !stored) {
      router.replace(routes.login);
      return;
    }

    if (user && user.role === 'ROLE_OPERADOR') {
      router.replace(routes.operatorWorkspace);
    }
  }, [token, user, router]);

  return (
    <AppShell>
      <TelemetryStreamMount />
      {children}
    </AppShell>
  );
}
