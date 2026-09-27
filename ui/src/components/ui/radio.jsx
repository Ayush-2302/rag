import React, { forwardRef } from 'react';
import { cn } from '../../lib/design-system/cn';

export const Radio = forwardRef(function Radio(
  {
    label,
    description,
    disabled = false,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? `radio-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex items-start gap-2.5 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input
        ref={ref}
        id={inputId}
        type="radio"
        disabled={disabled}
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border bg-surface text-primary',
          'focus:ring-2 focus:ring-focus-ring focus:outline-none transition-colors'
        )}
        {...props}
      />
      {(label || description) && (
        <div className="flex flex-col leading-tight">
          {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
          {description && <span className="text-xs text-text-muted mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
});

export function RadioGroup({
  label,
  options = [],
  name,
  value,
  onChange,
  disabled = false,
  className = '',
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <p className="text-sm font-medium text-text-secondary">{label}</p>}
      <div className="space-y-1.5">
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            label={option.label}
            description={option.description}
            disabled={disabled || option.disabled}
          />
        ))}
      </div>
    </div>
  );
}
