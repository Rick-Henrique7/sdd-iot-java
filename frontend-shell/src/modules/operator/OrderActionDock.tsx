'use client';

import { Play, Pause, CheckCircle } from 'lucide-react';
import { useOrderStatusMutation } from './useOrderStatusMutation';

export type WorkOrderStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

interface OrderActionDockProps {
  workOrderId: string;
  equipmentId: string;
  status: WorkOrderStatus;
  disabled?: boolean;
}

/**
 * Touch-friendly action bar for an active Work Order.
 *
 * - Each button is at least 64px tall (touch target).
 * - Background colour follows a traffic-light pattern:
 *   green to start, amber to pause, blue to complete.
 * - Calls PATCH /api/v1/operations/work-orders/{id}/status on click.
 */
export function OrderActionDock({
  workOrderId,
  equipmentId,
  status,
  disabled = false,
}: OrderActionDockProps) {
  const mutation = useOrderStatusMutation(workOrderId);

  function transition(next: WorkOrderStatus) {
    if (disabled || mutation.isPending) return;
    mutation.mutate({ status: next, equipmentId });
  }

  const isTerminal = status === 'COMPLETED' || status === 'CANCELLED';

  return (
    <div
      data-testid="order-action-dock"
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      role="group"
      aria-label="Controle da ordem de servico"
    >
      {status !== 'IN_PROGRESS' ? (
        <button
          type="button"
          aria-label="Iniciar tarefa"
          onClick={() => transition('IN_PROGRESS')}
          disabled={isTerminal || disabled || mutation.isPending}
          className="flex h-16 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-bold uppercase tracking-wider text-fg transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play size={20} aria-hidden />
          Iniciar
        </button>
      ) : (
        <button
          type="button"
          aria-label="Pausar tarefa"
          onClick={() => transition('PAUSED')}
          disabled={isTerminal || disabled || mutation.isPending}
          className="flex h-16 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-bold uppercase tracking-wider text-bg transition-colors hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pause size={20} aria-hidden />
          Pausar
        </button>
      )}

      <button
        type="button"
        aria-label="Concluir tarefa"
        onClick={() => transition('COMPLETED')}
        disabled={isTerminal || disabled || mutation.isPending}
        className="flex h-16 items-center justify-center gap-2 rounded-md bg-info px-4 text-sm font-bold uppercase tracking-wider text-fg transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle size={20} aria-hidden />
        Concluir
      </button>

      <button
        type="button"
        aria-label="Cancelar tarefa"
        onClick={() => transition('CANCELLED')}
        disabled={isTerminal || disabled || mutation.isPending}
        className="flex h-16 items-center justify-center gap-2 rounded-md border border-border bg-card-2 px-4 text-sm font-bold uppercase tracking-wider text-fg-muted transition-colors hover:bg-card hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}
