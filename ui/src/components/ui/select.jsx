import React, { forwardRef } from 'react';
import { cn } from '../../lib/design-system/cn';
import { ChevronDownIcon } from '../icons';

const SELECT_SIZES = {
  sm: 'h-7 text-xs pl-2.5 pr-8',
  md: 'h-9 text-sm pl-3 pr-8',
  lg: 'h-10 text-base pl-3.5 pr-9',
};

export const Select = forwardRef(function Select(
  {
    size = 'md',
    error = false,
    invalid = false,
    disabled = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const hasError = Boolean(error || invalid);

  return (
    <div className={cn('relative w-full', className)}>
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          'w-full appearance-none rounded-md border bg-surface text-text-primary',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted',
          SELECT_SIZES[size] || SELECT_SIZES.md,
          hasError
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-border focus:border-primary focus:ring-focus-ring'
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
});
