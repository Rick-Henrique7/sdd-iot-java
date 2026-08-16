'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DowntimeReason } from './DowntimeModal';

interface DowntimePayload {
  reason: DowntimeReason;
  notes?: string;
}

interface DowntimeResponse {
  id: string;
  equipmentId: string;
  reason: DowntimeReason;
  startedAt: string;
  endedAt?: string;
}

/**
 * POST /api/v1/operations/downtime
 *
 * The server always assigns PENDING; reason is the only field the
 * operator actually chooses on the dock. We optimistically close the
 * modal on success and invalidate the operations feed.
 */
export function useDowntimeMutation(equipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation<DowntimeResponse, Error, DowntimePayload>({
    mutationFn: (payload) =>
      api
        .post<DowntimeResponse>('/api/v1/operations/downtime', {
          equipmentId,
          reason: payload.reason,
          notes: payload.notes,
        })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}
