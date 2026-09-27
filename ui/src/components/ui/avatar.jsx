import React from 'react';
import { cn } from '../../lib/design-system/cn';

const AVATAR_SIZES = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
};

export function Avatar({
  name = '',
  src = null,
  size = 'md',
  status = null, // 'online' | 'offline' | 'busy'
  className = '',
}) {
  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover border border-border shadow-sm',
            AVATAR_SIZES[size] || AVATAR_SIZES.md
          )}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-primary font-bold text-text-inverse shadow-sm uppercase',
            AVATAR_SIZES[size] || AVATAR_SIZES.md
          )}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-surface',
            status === 'online' && 'bg-success',
            status === 'busy' && 'bg-danger',
            status === 'offline' && 'bg-text-disabled'
          )}
        />
      )}
    </div>
  );
}
