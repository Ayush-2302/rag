import React, { forwardRef } from 'react';
import { cn } from '../../lib/design-system/cn';

const INPUT_SIZES = {
  sm: 'h-7 text-xs px-2',
  md: 'h-9 text-sm px-3',
  lg: 'h-10 text-base px-3.5',
};

export const Input = forwardRef(function Input(
  {
    size = 'md',
    error = false,
    invalid = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    type = 'text',
    ...props
  },
  ref
) {
  const hasError = Boolean(error || invalid);

  return (
    <div className="relative flex w-full items-center">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 flex items-center text-text-muted">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          'w-full rounded-md border bg-surface text-text-primary placeholder:text-text-disabled',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted',
          INPUT_SIZES[size] || INPUT_SIZES.md,
          hasError
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-border focus:border-primary focus:ring-focus-ring',
          leftIcon && 'pl-9',
          rightIcon && 'pr-9',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <span className="pointer-events-none absolute right-3 flex items-center text-text-muted">
          {rightIcon}
        </span>
      )}
    </div>
  );
});
