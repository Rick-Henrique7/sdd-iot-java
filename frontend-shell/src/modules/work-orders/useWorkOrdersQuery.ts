'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type WorkOrderStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface WorkOrderDTO {
  id: string;
  equipmentId: string;
  fieldId?: string;
  operatorId: string;
  status: WorkOrderStatus;
  createdAt: string;
  updatedAt: string;
  operatorNotes?: string;
}

export interface PageResponseDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

interface UseWorkOrdersParams {
  status?: WorkOrderStatus;
  equipmentId?: string;
  page?: number;
  size?: number;
  /** Override the default 10s polling interval. */
  refetchIntervalMs?: number;
}

export function useWorkOrdersQuery(params: UseWorkOrdersParams = {}) {
  return useQuery({
    queryKey: ['work-orders', params],
    queryFn: () =>
      api
        .get<PageResponseDTO<WorkOrderDTO>>('/api/v1/operations/work-orders', {
          params: {
            status: params.status,
            equipmentId: params.equipmentId,
            page: params.page ?? 0,
            size: params.size ?? 50,
          },
        })
        .then((r) => r.data),
    refetchInterval: params.refetchIntervalMs ?? 10_000,
  });
}
