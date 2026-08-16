'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}

/**
 * Fetches the heatmap points for a given `fieldId` from
 * `GET /api/v1/mapping/heatmaps?fieldId=…`.
 *
 * The query is disabled when `fieldId` is null (the picker
 * hasn't chosen one yet) and cached per field for 60s.
 */
export function useHeatmap(fieldId: string | null) {
  return useQuery<HeatmapPoint[]>({
    queryKey: ['heatmap', fieldId],
    queryFn: async ({ signal }) => {
      if (!fieldId) return [];
      const { data } = await api.get<HeatmapPoint[]>('/api/v1/mapping/heatmaps', {
        params: { fieldId },
        signal,
      });
      return data;
    },
    enabled: Boolean(fieldId),
    staleTime: 60_000,
  });
}
