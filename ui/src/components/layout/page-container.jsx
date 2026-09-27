import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function PageContainer({
  maxWidth = 'max-w-6xl',
  className = '',
  children,
}) {
  return (
    <div className={cn('mx-auto w-full px-6 py-6 lg:px-8', maxWidth, className)}>
      {children}
    </div>
  );
}
