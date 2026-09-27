import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/design-system/cn';

const TabsContext = createContext(null);

export function Tabs({
  defaultValue,
  value,
  onChange,
  className = '',
  children,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalValue;

  const handleTabChange = (val) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, handleTabChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({
  variant = 'line', // 'line' | 'pills' | 'segmented'
  className = '',
  children,
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center',
        variant === 'line' && 'border-b border-border gap-6',
        variant === 'pills' && 'gap-1.5 p-1 bg-surface-soft border border-border rounded-lg',
        variant === 'segmented' && 'p-0.5 bg-surface-soft border border-border rounded-md inline-flex',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabTrigger({
  value,
  variant = 'line',
  disabled = false,
  className = '',
  children,
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabTrigger must be used inside Tabs');

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => context.handleTabChange(value)}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'line' && [
          'py-2.5 text-sm -mb-px border-b-2',
          isActive
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-hover',
        ],
        variant === 'pills' && [
          'px-3 py-1.5 text-xs rounded-md',
          isActive
            ? 'bg-surface text-text-primary font-semibold shadow-sm'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-hover/50',
        ],
        variant === 'segmented' && [
          'px-3 py-1 text-xs rounded',
          isActive
            ? 'bg-surface text-text-primary font-semibold shadow-sm border border-border'
            : 'text-text-muted hover:text-text-primary',
        ],
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabContent({ value, className = '', children }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabContent must be used inside Tabs');

  if (context.activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn('animate-fade-in pt-3', className)}>
      {children}
    </div>
  );
}

// Backward-compatible SegmentedControl built on standard tab/radio pattern
export function SegmentedControl({ name, options, value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-border bg-surface-soft p-0.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            'cursor-pointer rounded px-3 py-1 text-xs font-medium transition-all select-none',
            value === opt.value
              ? 'border border-border bg-surface text-text-primary shadow-sm font-semibold'
              : 'border border-transparent text-text-muted hover:text-text-primary'
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange?.(opt.value)}
            className="sr-only"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
