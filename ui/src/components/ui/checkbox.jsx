import React, { forwardRef } from 'react';
import { cn } from '../../lib/design-system/cn';

export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    error,
    disabled = false,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex items-start gap-2.5 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 rounded border border-border bg-surface text-primary',
          'focus:ring-2 focus:ring-focus-ring focus:outline-none transition-colors',
          error && 'border-danger'
        )}
        {...props}
      />
      {(label || description) && (
        <div className="flex flex-col leading-tight">
          {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
          {description && <span className="text-xs text-text-muted mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
});
