'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * Tiny bottom-right ephemeral toast. Rendered as a child of
 * the page that owns the message state. Single-instance, no
 * queue — adequate for the two actions in `/settings` (one
 * toast at a time).
 */
export function Toast({ message, onDismiss, durationMs = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onDismiss, 200);
    }, durationMs);
    return () => window.clearTimeout(t);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 right-6 z-50 transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-fg shadow-shell-sidebar">
        <Check size={14} className="text-brand" aria-hidden />
        <span>{message}</span>
      </div>
    </div>
  );
}

/**
 * Re-export `ReactNode` so consumers don't have to import it
 * separately when the toast contains arbitrary content.
 */
export type { ReactNode };
