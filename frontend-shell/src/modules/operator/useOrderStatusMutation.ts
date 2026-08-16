'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface StatusPayload {
  status: string;
  equipmentId?: string;
}

interface StatusResponse {
  id: string;
  status: string;
}

/**
 * PATCH /api/v1/operations/work-orders/{id}/status
 *
 * Invalidates the `work-order` query so consumers (Operator workspace
 * and future Operations dashboard) refetch fresh state.
 */
export function useOrderStatusMutation(workOrderId: string) {
  const queryClient = useQueryClient();

  return useMutation<StatusResponse, Error, StatusPayload>({
    mutationFn: (payload) =>
      api
        .patch<StatusResponse>(
          `/api/v1/operations/work-orders/${workOrderId}/status`,
          payload,
        )
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order', workOrderId] });
    },
  });
}
