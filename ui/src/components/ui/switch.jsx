import React from 'react';
import { cn } from '../../lib/design-system/cn';

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  id,
  className = '',
}) {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <div className="relative inline-flex items-center">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'h-5 w-9 rounded-full transition-colors duration-200',
            checked ? 'bg-primary' : 'bg-border'
          )}
        />
        <div
          className={cn(
            'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-surface shadow-sm transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </div>
      {(label || description) && (
        <div className="flex flex-col leading-tight">
          {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
          {description && <span className="text-xs text-text-muted mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
}
