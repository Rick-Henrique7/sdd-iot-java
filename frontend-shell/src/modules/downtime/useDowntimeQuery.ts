'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type DowntimeReason =
  | 'REFUELING'
  | 'MECHANICAL_BREAKDOWN'
  | 'WEATHER_ADVERSE'
  | 'MEAL_BREAK';

export interface DowntimeDTO {
  id: string;
  equipmentId: string;
  operatorId: string;
  reason: DowntimeReason;
  startTime: string;
  endTime?: string;
  comments?: string;
}

export interface PageResponseDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

const REASON_LABELS: Record<DowntimeReason, string> = {
  REFUELING:            'Abastecimento',
  MECHANICAL_BREAKDOWN: 'Manutencao / Quebra',
  WEATHER_ADVERSE:      'Clima Adverso',
  MEAL_BREAK:           'Intervalo',
};

export function reasonLabel(r: DowntimeReason): string {
  return REASON_LABELS[r];
}

interface UseDowntimeParams {
  equipmentId?: string;
  page?: number;
  size?: number;
  refetchIntervalMs?: number;
}

export function useDowntimeQuery(params: UseDowntimeParams = {}) {
  return useQuery({
    queryKey: ['downtime', params],
    queryFn: () =>
      api
        .get<PageResponseDTO<DowntimeDTO>>('/api/v1/operations/downtime', {
          params: {
            equipmentId: params.equipmentId,
            page: params.page ?? 0,
            size: params.size ?? 50,
          },
        })
        .then((r) => r.data),
    refetchInterval: params.refetchIntervalMs ?? 15_000,
  });
}
