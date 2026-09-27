import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-border-light', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3.5',
            i === lines - 1 ? 'w-3/5' : i === 0 ? 'w-full' : 'w-4/5'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonRows({ rows = 3, cols = 4, className = '' }) {
  return (
    <div className={cn('divide-y divide-border-light', className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn(
                'h-3.5',
                c === 0 ? 'w-1/4' : 'flex-1'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface p-5 space-y-4 shadow-sm', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
