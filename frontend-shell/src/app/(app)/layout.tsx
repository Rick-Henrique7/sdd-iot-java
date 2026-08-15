'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { routes } from '@/lib/routes';
import { AppShell } from '@/components/layout/AppShell';

/**
 * Client-side guard for the authenticated area. Hydrates the auth
 * store from localStorage on mount, then redirects to /login if no
 * token is present. Server-rendered children are still useful
 * (e.g. for SEO of placeholder pages), so we don't `redirect()`
 * server-side.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // After hydration completes, redirect if still unauthenticated.
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem('agrio.token')
      : null;
    if (!token && !stored) {
      router.replace(routes.login);
    }
  }, [token, router]);

  return <AppShell>{children}</AppShell>;
}
