import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/design-system/cn';

export function Dropdown({
  trigger,
  align = 'right', // 'left' | 'right'
  className = '',
  children,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            'absolute top-full mt-1.5 z-40 min-w-44 rounded-lg border border-border bg-surface p-1 shadow-lg animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  onClick,
  destructive = false,
  disabled = false,
  icon = null,
  className = '',
  children,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-left transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        destructive
          ? 'text-danger hover:bg-danger-soft active:bg-danger-soft/80'
          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-surface-active',
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function DropdownDivider({ className = '' }) {
  return <div className={cn('my-1 border-t border-border-light', className)} />;
}
