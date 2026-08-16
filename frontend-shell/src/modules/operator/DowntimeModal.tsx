'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useDowntimeMutation } from './useDowntimeMutation';

export type DowntimeReason =
  | 'REFUELING'
  | 'MECHANICAL_BREAKDOWN'
  | 'WEATHER_ADVERSE'
  | 'MEAL_BREAK';

interface DowntimeModalProps {
  open: boolean;
  equipmentId: string;
  onClose: () => void;
  onSubmitted?: (message: string) => void;
}

const REASONS: Array<{ value: DowntimeReason; label: string }> = [
  { value: 'REFUELING',            label: 'Abastecimento' },
  { value: 'MECHANICAL_BREAKDOWN', label: 'Manutencao / Quebra' },
  { value: 'WEATHER_ADVERSE',      label: 'Clima Adverso' },
  { value: 'MEAL_BREAK',           label: 'Intervalo' },
];

/**
 * 2-tap downtime registration modal.
 *
 * 1st tap: select a reason (visually marks the chosen tile).
 * 2nd tap: confirm and POST /api/v1/operations/downtime.
 * Esc or overlay click: dismiss without submitting.
 */
export function DowntimeModal({
  open,
  equipmentId,
  onClose,
  onSubmitted,
}: DowntimeModalProps) {
  const [selected, setSelected] = useState<DowntimeReason | null>(null);
  const mutation = useDowntimeMutation(equipmentId);

  // Reset selection whenever the modal is closed/reopened.
  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  // Close on Esc.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleReasonClick(reason: DowntimeReason) {
    // 2nd tap on the same reason = confirm.
    if (selected === reason) {
      mutation.mutate(
        { reason },
        {
          onSuccess: () => {
            onSubmitted?.('Parada registrada');
            onClose();
          },
        },
      );
      return;
    }
    setSelected(reason);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="downtime-modal-title"
      data-testid="downtime-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id="downtime-modal-title"
            className="text-h2 font-semibold text-fg"
          >
            Registrar parada
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded p-1 text-fg-muted hover:bg-card-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <p className="text-sm text-fg-muted">
          Selecione o motivo e toque novamente para confirmar.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {REASONS.map(({ value, label }) => {
            const isSelected = selected === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                data-reason={value}
                onClick={() => handleReasonClick(value)}
                disabled={mutation.isPending}
                className={`flex h-16 items-center justify-center rounded-md border px-3 text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSelected
                    ? 'border-brand bg-brand text-fg'
                    : 'border-border bg-card-2 text-fg hover:bg-card'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {mutation.isError && (
          <p
            role="alert"
            className="text-xs font-medium text-critical"
          >
            Falha ao registrar parada. Tente novamente.
          </p>
        )}
      </div>
    </div>
  );
}
