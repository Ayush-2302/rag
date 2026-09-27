import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function ContentGrid({
  columns = 2, // 1 | 2 | 3 | 4
  gap = 'normal', // 'compact' | 'normal' | 'loose'
  className = '',
  children,
}) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 sm:grid-cols-2';

  const gapClass = {
    compact: 'gap-3',
    normal: 'gap-4',
    loose: 'gap-6',
  }[gap] || 'gap-4';

  return (
    <div className={cn('grid', colClass, gapClass, className)}>
      {children}
    </div>
  );
}

export function Stack({
  spacing = 'normal', // 'compact' | 'normal' | 'loose'
  className = '',
  children,
}) {
  const spaceClass = {
    compact: 'space-y-2',
    normal: 'space-y-4',
    loose: 'space-y-6',
  }[spacing] || 'space-y-4';

  return <div className={cn(spaceClass, className)}>{children}</div>;
}

export function Inline({
  gap = 'normal', // 'compact' | 'normal' | 'loose'
  align = 'center', // 'center' | 'start' | 'end'
  wrap = true,
  className = '',
  children,
}) {
  const gapClass = {
    compact: 'gap-2',
    normal: 'gap-3',
    loose: 'gap-4',
  }[gap] || 'gap-3';

  return (
    <div
      className={cn(
        'flex items-center',
        wrap && 'flex-wrap',
        align === 'start' && 'items-start',
        align === 'end' && 'items-end',
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
}
