import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function EmptyState({
  icon = null,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  action = null,
  secondaryAction = null,
  compact = false,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center select-none',
        compact ? 'px-4 py-8' : 'px-6 py-14',
        className
      )}
    >
      {icon && (
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-surface-soft border border-border text-text-muted shadow-sm">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h4>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-text-muted leading-relaxed">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
