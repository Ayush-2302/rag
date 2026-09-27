import React from 'react';
import { cn } from '../../lib/design-system/cn';

/**
 * DefinitionList for key-value facts and metadata.
 */
export function DefinitionList({ items = [], className = '' }) {
  return (
    <dl className={cn('divide-y divide-border-light text-sm', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="shrink-0 text-xs font-medium text-text-muted">{item.label}</dt>
          <dd className="text-right text-xs font-semibold text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
