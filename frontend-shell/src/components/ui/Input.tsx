'use client';

import { Eye, EyeOff } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  useState,
  type ReactNode,
} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightAdornment?: ReactNode;
}

const baseField =
  'h-10 w-full rounded-md border border-border bg-card-2 px-3 text-sm ' +
  'text-fg placeholder:text-fg-muted ' +
  'focus-visible:border-brand focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightAdornment, type = 'text', id, ...rest },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;
  const fieldId = id ?? `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <label htmlFor={fieldId} className="block text-sm">
      {label && (
        <span className="mb-1.5 block text-h2 uppercase tracking-wide text-fg-muted">
          {label}
        </span>
      )}
      <span className="relative block">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-fg-muted">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          id={fieldId}
          ref={ref}
          type={effectiveType}
          className={`${baseField} ${leftIcon ? 'pl-9' : ''} ${
            isPassword || rightAdornment ? 'pr-10' : ''
          }`}
        />
        {(isPassword || rightAdornment) && (
          <span className="absolute inset-y-0 right-2 flex items-center">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="rounded p-1 text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            ) : (
              rightAdornment
            )}
          </span>
        )}
      </span>
      {error ? (
        <span className="mt-1 block text-xs text-critical">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-fg-muted">{hint}</span>
      ) : null}
    </label>
  );
});
