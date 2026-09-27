import React from 'react';
import { Card } from './card';
import { cn } from '../../lib/design-system/cn';

export function StatCard({
  title,
  value,
  description,
  icon = null,
  trend = null, // { value: '+12%', isPositive: true }
  action = null,
  className = '',
}) {
  return (
    <Card className={cn('p-5 flex flex-col justify-between', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-text-primary">{value}</p>
        </div>
        {icon && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-soft border border-border text-primary">
            {icon}
          </div>
        )}
      </div>

      {(description || trend || action) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center font-semibold rounded-full px-1.5 py-0.5 text-xs',
                  trend.isPositive
                    ? 'bg-success-soft text-success border border-success/20'
                    : 'bg-danger-soft text-danger border border-danger/20'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {description && <span className="text-text-muted">{description}</span>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
    </Card>
  );
}

export const MetricCard = StatCard;
export const SummaryCard = StatCard;
