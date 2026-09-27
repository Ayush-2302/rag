import React from 'react';
import { Spinner } from './spinner';
import { cn } from '../../lib/design-system/cn';

export function LoadingState({
  message = 'Loading…',
  description = 'Please wait while we retrieve the latest information.',
  size = 'md',
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 select-none',
        className
      )}
      role="status"
    >
      <Spinner size={size} className="text-primary mb-3" />
      <p className="text-sm font-medium text-text-primary">{message}</p>
      {description && (
        <p className="mt-1 text-xs text-text-muted max-w-sm">{description}</p>
      )}
    </div>
  );
}

export function PageLoader({ message = 'Loading workspace…' }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <LoadingState message={message} size="lg" />
    </div>
  );
}

export function ButtonLoader({ size = 'sm' }) {
  return <Spinner size={size} />;
}
