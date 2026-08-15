'use client';

import { ChevronDown } from 'lucide-react';
import {
  forwardRef,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

const baseField =
  'h-10 w-full appearance-none rounded-md border border-border bg-card-2 ' +
  'px-3 pr-9 text-sm text-fg focus-visible:border-brand focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className = '', children, ...rest },
  ref,
) {
  const fieldId = id ?? `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label htmlFor={fieldId} className="block text-sm">
      {label && (
        <span className="mb-1.5 block text-h2 uppercase tracking-wide text-fg-muted">
          {label}
        </span>
      )}
      <span className="relative block">
        <select
          {...rest}
          id={fieldId}
          ref={ref}
          className={`${baseField} ${className}`}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted"
        />
      </span>
      {error && (
        <span className="mt-1 block text-xs text-critical">{error}</span>
      )}
    </label>
  );
});
