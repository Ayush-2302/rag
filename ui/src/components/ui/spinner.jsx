import React from 'react';
import { cn } from '../../lib/design-system/cn';

const SPINNER_SIZES = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 24,
};

export function Spinner({
  size = 'sm',
  className = '',
  ...props
}) {
  const pixelSize = typeof size === 'number' ? size : (SPINNER_SIZES[size] || 14);

  return (
    <svg
      className={cn('animate-spin text-current shrink-0', className)}
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
