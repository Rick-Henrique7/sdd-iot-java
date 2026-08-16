'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { routes } from '@/lib/routes';

/**
 * Client-side guard for the Operator workspace.
 *
 * - Hydrates the auth store from localStorage on mount.
 * - Redirects to /login if there is no token.
 * - Redirects to /dashboard if the user is NOT an operator (any other
 *   role lands on the Gestor shell instead).
 *
 * Intentionally NOT wrapped in <AppShell> — the operator profile
 * has its own full-bleed layout (touch-friendly, no sidebar).
 */
export default function OperatorLayout({ children }: { children: ReactNode }) {
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

    // Role guard — only operators land here.
    if (user && user.role !== 'ROLE_OPERADOR') {
      router.replace(routes.dashboard);
    }
  }, [token, user, router]);

  return <>{children}</>;
}
