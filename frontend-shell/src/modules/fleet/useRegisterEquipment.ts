'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Equipment } from '@/types/equipment';

/**
 * Mutation hook for `POST /api/v1/fleet`. On success, invalidates
 * the `['fleet']` query so the table refreshes. Used by both
 * the register modal (new equipment) and the status toggle
 * (re-POST with the same id — the backend's
 * `RegisterEquipmentUseCase` is effectively an upsert).
 */
export function useRegisterEquipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Equipment) => api.post<Equipment>('/api/v1/fleet', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fleet'] }),
  });
}
