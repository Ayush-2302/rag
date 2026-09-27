import React from 'react';
import { cn } from '../../lib/design-system/cn';
import { AlertIcon } from '../icons';
import { Button } from '../ui/button';

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this section. Please try again.',
  error,
  onRetry,
  compact = false,
  className = '',
}) {
  const errorMessage = error?.message || (typeof error === 'string' ? error : null);

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-lg border border-danger/20 bg-danger-soft/50',
        compact ? 'p-6' : 'p-10',
        className
      )}
    >
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-danger-soft border border-danger/20 text-danger">
        <AlertIcon size={20} />
      </div>
      <h4 className="text-sm font-semibold text-danger">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-text-muted leading-relaxed">
        {errorMessage || description}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

export function InlineError({ message, className = '' }) {
  if (!message) return null;
  return (
    <div className={cn('flex items-center gap-1.5 text-xs text-danger font-medium', className)}>
      <AlertIcon size={13} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export const FormError = InlineError;
