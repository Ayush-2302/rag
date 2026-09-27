import React from 'react';
import { cn } from '../../lib/design-system/cn';
import { getPriorityConfig } from '../../config/priority-config';

export function PriorityBadge({
  priority,
  size = 'sm',
  showDot = true,
  className = '',
  children,
}) {
  const config = getPriorityConfig(priority);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium leading-none select-none transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.badgeClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)}
        />
      )}
      {children || config.label}
    </span>
  );
}
