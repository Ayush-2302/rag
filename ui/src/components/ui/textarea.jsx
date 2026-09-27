import React, { forwardRef } from 'react';
import { cn } from '../../lib/design-system/cn';

export const Textarea = forwardRef(function Textarea(
  {
    error = false,
    invalid = false,
    disabled = false,
    rows = 3,
    className = '',
    ...props
  },
  ref
) {
  const hasError = Boolean(error || invalid);

  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={cn(
        'w-full rounded-md border bg-surface p-3 text-sm text-text-primary placeholder:text-text-disabled',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted',
        hasError
          ? 'border-danger focus:border-danger focus:ring-danger/20'
          : 'border-border focus:border-primary focus:ring-focus-ring',
        className
      )}
      {...props}
    />
  );
});
