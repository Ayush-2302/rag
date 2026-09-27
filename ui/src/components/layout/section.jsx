import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function Section({
  title,
  description,
  actions = null,
  spacing = 'normal', // 'compact' | 'normal' | 'loose'
  className = '',
  children,
  ...props
}) {
  return (
    <section
      className={cn(
        spacing === 'compact' && 'space-y-2',
        spacing === 'normal' && 'space-y-4',
        spacing === 'loose' && 'space-y-6',
        className
      )}
      {...props}
    >
      {(title || description || actions) && (
        <SectionHeader
          title={title}
          description={description}
          actions={actions}
        />
      )}
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  actions = null,
  className = '',
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2', className)}>
      <div className="space-y-0.5">
        {title && (
          <h2 className="text-sm font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-xs text-text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
