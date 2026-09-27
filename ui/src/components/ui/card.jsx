import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface shadow-sm overflow-hidden transition-colors',
        variant === 'interactive' && 'hover:border-border-hover hover:shadow-md cursor-pointer',
        variant === 'flat' && 'shadow-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-5 py-3.5',
        className
      )}
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          <div className="space-y-0.5">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </>
      )}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3
      className={cn('text-sm font-semibold tracking-tight text-text-primary', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p
      className={cn('text-xs text-text-muted leading-normal', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t border-border-light bg-surface-soft/60 px-5 py-3 text-xs text-text-muted',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Backward-compatible alias for existing Panel usages
export const Panel = Card;
export const PanelHeader = CardHeader;
