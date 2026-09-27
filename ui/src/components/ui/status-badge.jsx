import React from 'react';
import { cn } from '../../lib/design-system/cn';
import { getStatusConfig } from '../../config/status-config';

export function StatusBadge({
  status,
  size = 'sm',
  showDot = true,
  className = '',
  children,
}) {
  const config = getStatusConfig(status);

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

export function StatusDot({
  tone = 'neutral',
  status,
  size = 6,
  className = '',
  children,
}) {
  let dotBg = 'bg-text-muted';
  if (status) {
    const config = getStatusConfig(status);
    dotBg = config.dotColor;
  } else {
    const map = {
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
      neutral: 'bg-text-muted',
    };
    dotBg = map[tone] || 'bg-text-muted';
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary', className)}>
      <span
        className={cn('rounded-full shrink-0', dotBg)}
        style={{ width: size, height: size }}
      />
      {children}
    </span>
  );
}
