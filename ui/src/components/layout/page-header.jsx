import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function PageHeader({
  title,
  description,
  actions = null,
  meta = null,
  breadcrumbs = null,
  maxWidth = 'max-w-6xl',
  className = '',
}) {
  return (
    <div className={cn('border-b border-border bg-surface px-6 lg:px-8', className)}>
      <div className={cn('mx-auto flex flex-wrap items-end justify-between gap-4 py-5', maxWidth)}>
        <div className="space-y-1">
          {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
          <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-text-muted leading-relaxed sm:text-sm">
              {description}
            </p>
          )}
        </div>

        {(actions || meta) && (
          <div className="flex flex-wrap items-center gap-3">
            {meta}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function PageTitle({ className = '', children }) {
  return (
    <h1 className={cn('text-xl font-bold tracking-tight text-text-primary sm:text-2xl', className)}>
      {children}
    </h1>
  );
}

export function PageDescription({ className = '', children }) {
  return (
    <p className={cn('text-xs text-text-muted leading-relaxed sm:text-sm', className)}>
      {children}
    </p>
  );
}
