import React, { useEffect } from 'react';
import { cn } from '../../lib/design-system/cn';
import { XIcon } from '../icons';

export function Drawer({
  open = false,
  onClose,
  position = 'left', // 'left' | 'right'
  width = 'w-72',
  className = '',
  children,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && open && onClose) {
        onClose();
      }
    }
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute inset-y-0 bg-surface shadow-2xl transition-transform duration-200 z-10 flex flex-col',
          position === 'left' ? 'left-0' : 'right-0',
          width,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
