import React from 'react';
import { cn } from '../../lib/design-system/cn';
import { AlertIcon, XIcon } from '../icons';

const ALERT_VARIANTS = {
  info: 'border-info/20 bg-info-soft text-info',
  success: 'border-success/20 bg-success-soft text-success',
  warning: 'border-warning/20 bg-warning-soft text-warning',
  danger: 'border-danger/20 bg-danger-soft text-danger',
};

export function Alert({
  variant = 'info',
  tone, // fallback for legacy tone prop
  title,
  onDismiss,
  className = '',
  children,
}) {
  const activeVariant = tone || variant;
  const variantClasses = ALERT_VARIANTS[activeVariant] || ALERT_VARIANTS.info;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border p-4 text-xs leading-relaxed transition-all duration-150',
        variantClasses,
        className
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <AlertIcon size={16} className="mt-0.5 shrink-0" />
        <div className="space-y-0.5 min-w-0">
          {title && <p className="font-semibold">{title}</p>}
          <div className="text-current opacity-90">{children}</div>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="-m-1 shrink-0 rounded p-1 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  );
}
