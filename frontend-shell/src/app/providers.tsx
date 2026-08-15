'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/queryClient';

export function Providers({ children }: { children: ReactNode }) {
  // useState ensures the client survives re-renders without leaking
  // the cache between users on the same browser (SSR-safety).
  const [client] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
