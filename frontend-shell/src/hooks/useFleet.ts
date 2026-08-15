'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Equipment } from '@/types/equipment';

/**
 * Fetches the fleet list from `GET /api/v1/fleet`.
 * The dashboard polls this every 5 s.
 */
export function useFleet() {
  return useQuery<Equipment[]>({
    queryKey: ['fleet'],
    queryFn: async () => {
      const { data } = await api.get<Equipment[]>('/api/v1/fleet');
      return data;
    },
    refetchInterval: 5_000,
  });
}
