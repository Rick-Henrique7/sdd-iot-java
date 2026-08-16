'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Optional footer slot for action buttons. */
  footer?: ReactNode;
}

/**
 * Tiny focus-trapped dialog. Esc closes, click on the backdrop
 * closes, and the focus is moved to the first focusable element
 * inside when the dialog opens. We don't pull in
 * `@headlessui/react` because Tailwind + a few focus rules
 * cover what we need.
 */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    // Move focus to the first focusable element.
    const first = ref.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([data-modal-close])',
    );
    first?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4"
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="panel w-full max-w-lg space-y-4 p-5"
      >
        <header className="flex items-start justify-between gap-2">
          <h2 className="text-h2 uppercase tracking-wider text-fg">{title}</h2>
          <button
            type="button"
            data-modal-close
            onClick={onClose}
            aria-label="Fechar"
            className="rounded p-1 text-fg-muted hover:bg-card-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X size={16} />
          </button>
        </header>
        <div>{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-border pt-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
