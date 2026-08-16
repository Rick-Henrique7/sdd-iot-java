'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

/**
 * Tiny labelled toggle. The checkbox is visually hidden but
 * still focusable; the visible track + thumb are styled with
 * Tailwind using the brand palette.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className = '', id, ...rest },
  ref,
) {
  const fieldId = id ?? `switch-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'toggle'}`;
  return (
    <label htmlFor={fieldId} className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <span className="relative inline-block h-5 w-9">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-card-2 transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-disabled:opacity-50"
        />
        <span
          aria-hidden
          className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-fg-muted transition-transform peer-checked:translate-x-4 peer-checked:bg-fg"
        />
      </span>
      {label && <span className="text-fg-body">{label}</span>}
      {className && <span className={className} />}
    </label>
  );
});
