import React from 'react';
import { cn } from '../../lib/design-system/cn';
import { Spinner } from './spinner';

const BUTTON_VARIANTS = {
  primary:
    'bg-primary text-text-inverse border border-primary hover:bg-primary-hover active:bg-primary-active focus-visible:ring-2 focus-visible:ring-focus-ring shadow-sm',
  secondary:
    'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary active:bg-surface-active focus-visible:ring-2 focus-visible:ring-focus-ring shadow-sm',
  outline:
    'bg-transparent text-text-primary border border-border hover:bg-surface-hover hover:border-border-hover active:bg-surface-active focus-visible:ring-2 focus-visible:ring-focus-ring',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-surface-hover hover:text-text-primary active:bg-surface-active focus-visible:ring-2 focus-visible:ring-focus-ring',
  danger:
    'bg-danger text-text-inverse border border-danger hover:bg-danger-hover active:bg-danger-hover/90 focus-visible:ring-2 focus-visible:ring-danger/20 shadow-sm',
  'ghost-danger':
    'bg-transparent text-danger border border-transparent hover:bg-danger-soft active:bg-danger-soft/80',
  link:
    'bg-transparent text-link hover:text-link-hover p-0 h-auto border-0 underline-offset-4 hover:underline shadow-none',
};

const BUTTON_SIZES = {
  xs: 'h-6 px-2 text-xs rounded-sm gap-1',
  sm: 'h-7 px-2.5 text-xs rounded-md gap-1.5',
  md: 'h-9 px-3.5 text-sm rounded-md gap-1.5',
  lg: 'h-10 px-4 text-base rounded-md gap-2',
};

const ICON_ONLY_SIZES = {
  xs: 'h-6 w-6 p-0 text-xs rounded-sm',
  sm: 'h-7 w-7 p-0 text-xs rounded-md',
  md: 'h-9 w-9 p-0 text-sm rounded-md',
  lg: 'h-10 w-10 p-0 text-base rounded-md',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  iconOnly = false,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const isIconButton = iconOnly && !children;
  const sizeClasses = isIconButton ? ICON_ONLY_SIZES[size] : BUTTON_SIZES[size];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-all duration-150',
        'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.secondary,
        sizeClasses,
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

export function IconButton({
  icon,
  'aria-label': ariaLabel,
  ...props
}) {
  return (
    <Button iconOnly aria-label={ariaLabel} {...props}>
      {icon}
    </Button>
  );
}
