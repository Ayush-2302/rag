import React from 'react';
import { cn } from '../../lib/design-system/cn';

const BADGE_VARIANTS = {
  neutral: 'bg-surface-soft text-text-secondary border-border',
  default: 'bg-surface-soft text-text-secondary border-border',
  primary: 'bg-primary-soft text-primary border-primary/20',
  secondary: 'bg-secondary-soft text-text-secondary border-border',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  info: 'bg-info-soft text-info border-info/20',
};

const BADGE_SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  variant = 'neutral',
  tone, // fallback for legacy tone prop
  size = 'sm',
  className = '',
  dot = false,
  dotColor,
  icon = null,
  children,
}) {
  const chosenVariant = tone || variant;
  const variantClass = BADGE_VARIANTS[chosenVariant] || BADGE_VARIANTS.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium leading-none select-none transition-colors',
        BADGE_SIZES[size] || BADGE_SIZES.sm,
        variantClass,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotColor || 'bg-current'
          )}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
