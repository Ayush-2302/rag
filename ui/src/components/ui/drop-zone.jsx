import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function DropZone({
  isDragging = false,
  onDrop,
  onDragOver,
  onDragLeave,
  className = '',
  children,
  ...props
}) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-all duration-150 select-none',
        isDragging
          ? 'border-primary bg-primary-soft/70 ring-2 ring-primary/20 scale-[0.99]'
          : 'border-border bg-surface-soft/60 hover:border-primary/50 hover:bg-surface-hover/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default DropZone;
