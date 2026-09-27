import React from 'react';
import { cn } from '../../lib/design-system/cn';
import { AlertIcon } from '../icons';

export function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  description,
  error,
  className = '',
  children,
}) {
  const helperText = description || hint;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={htmlFor}
            className="block text-sm font-medium text-text-secondary"
          >
            {label}
            {required ? (
              <span className="ml-1 text-danger font-bold" aria-hidden="true">*</span>
            ) : (
              <span className="ml-1 text-xs font-normal text-text-muted">(optional)</span>
            )}
          </label>
        </div>
      )}

      {children}

      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-danger font-medium mt-1">
          <AlertIcon size={12} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : (
        helperText && (
          <p className="text-xs text-text-muted mt-1 leading-normal">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}

// Backward-compatible alias for existing Field usages
export const Field = FormField;
