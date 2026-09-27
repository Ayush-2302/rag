import React, { useEffect } from 'react';
import { cn } from '../../lib/design-system/cn';
import { XIcon } from '../icons';

export function Modal({
  open = false,
  onClose,
  maxWidth = 'max-w-lg',
  variant = 'default', // 'default' | 'confirm' | 'danger' | 'warning'
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

  const variantStyles = {
    default: 'border-border',
    confirm: 'border-border max-w-md',
    danger: 'border-danger/30 max-w-md',
    warning: 'border-warning/30 max-w-md',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm transition-opacity animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl border bg-surface shadow-xl z-10',
          variantStyles[variant] || variantStyles.default,
          maxWidth,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  title,
  description,
  onClose,
  className = '',
  children,
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between border-b border-border-light px-6 py-4',
        className
      )}
    >
      {children ? (
        children
      ) : (
        <div className="space-y-1">
          {title && <ModalTitle>{title}</ModalTitle>}
          {description && <ModalDescription>{description}</ModalDescription>}
        </div>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-text-muted hover:bg-surface-soft hover:text-text-primary transition-colors -mr-1"
          aria-label="Close dialog"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
}

export function ModalTitle({ className = '', children, ...props }) {
  return (
    <h2
      className={cn('text-base font-semibold text-text-primary tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function ModalDescription({ className = '', children, ...props }) {
  return (
    <p
      className={cn('text-xs text-text-muted leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function ModalContent({ className = '', children, ...props }) {
  return (
    <div className={cn('p-6 space-y-4 max-h-[80vh] overflow-y-auto', className)} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2.5 border-t border-border-light bg-surface-soft/60 px-6 py-3.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Re-export confirm dialog and modal variants from confirm-dialog
export { ConfirmDialog, ConfirmModal, useConfirm } from './confirm-dialog';
