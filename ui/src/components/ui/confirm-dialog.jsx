import React, { useState, useRef, useCallback } from 'react';
import { cn } from '../../lib/design-system/cn';
import { Modal, ModalFooter } from './modal';
import { Button } from './button';
import {
  AlertTriangleIcon,
  InfoIcon,
  CheckCircleIcon,
  TrashIcon,
  AlertIcon,
  XIcon,
} from '../icons';

/**
 * Visual styling presets for ConfirmDialog variants.
 */
const CONFIRM_VARIANTS = {
  danger: {
    icon: AlertTriangleIcon,
    iconBg: 'bg-danger-soft text-danger border border-danger/25',
    confirmButtonVariant: 'danger',
    defaultConfirmText: 'Delete',
  },
  destructive: {
    icon: TrashIcon,
    iconBg: 'bg-danger-soft text-danger border border-danger/25',
    confirmButtonVariant: 'danger',
    defaultConfirmText: 'Delete',
  },
  warning: {
    icon: AlertIcon,
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25',
    confirmButtonVariant: 'primary',
    defaultConfirmText: 'Proceed',
  },
  info: {
    icon: InfoIcon,
    iconBg: 'bg-primary-soft text-primary border border-primary/25',
    confirmButtonVariant: 'primary',
    defaultConfirmText: 'Confirm',
  },
  primary: {
    icon: InfoIcon,
    iconBg: 'bg-primary-soft text-primary border border-primary/25',
    confirmButtonVariant: 'primary',
    defaultConfirmText: 'Confirm',
  },
  success: {
    icon: CheckCircleIcon,
    iconBg: 'bg-success-soft text-success border border-success/25',
    confirmButtonVariant: 'primary',
    defaultConfirmText: 'Continue',
  },
};

/**
 * ConfirmDialog / ConfirmModal Component
 *
 * Variants:
 * - 'danger' | 'destructive': High-impact destructive operations (e.g. deletion, reset).
 * - 'warning': Cautious actions (e.g. deactivate user, revoke token).
 * - 'info' | 'primary': Standard informational confirmation.
 * - 'success': Positive confirmation / validation step.
 */
export function ConfirmDialog({
  open = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'Please confirm this action. It may not be reversible.',
  confirmText,
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  icon: CustomIcon,
  maxWidth = 'max-w-md',
  children,
}) {
  const config = CONFIRM_VARIANTS[variant] || CONFIRM_VARIANTS.primary;
  const IconComponent = CustomIcon || config.icon;
  const finalConfirmText = confirmText || config.defaultConfirmText;

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      className="p-0 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Variant Icon Container */}
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform',
              config.iconBg
            )}
          >
            <IconComponent size={22} />
          </div>

          {/* Content & Details */}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold tracking-tight text-text-primary">
                {title}
              </h3>
              {onClose && !loading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors -mr-1 -mt-1"
                  aria-label="Close dialog"
                >
                  <XIcon size={16} />
                </button>
              )}
            </div>

            {description && (
              <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
                {description}
              </p>
            )}

            {children && <div className="mt-3.5 text-sm">{children}</div>}
          </div>
        </div>
      </div>

      <ModalFooter className="bg-surface-soft/80 border-t border-border-light px-6 py-3.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={config.confirmButtonVariant}
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {finalConfirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Re-export alias for natural component terminology
export const ConfirmModal = ConfirmDialog;

/**
 * Imperative hook to trigger confirmation dialogs cleanly without managing modal open booleans.
 *
 * Usage:
 * const [ConfirmComponent, confirm] = useConfirm();
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: 'Delete user?',
 *     description: 'This cannot be undone.',
 *     variant: 'danger',
 *   });
 *   if (!ok) return;
 *   // perform action...
 * };
 *
 * return (
 *   <>
 *     ...
 *     <ConfirmComponent />
 *   </>
 * );
 */
export function useConfirm() {
  const [state, setState] = useState({
    open: false,
    title: '',
    description: '',
    variant: 'danger',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        open: true,
        title: options.title || 'Are you sure?',
        description: options.description || 'Please confirm this action.',
        variant: options.variant || 'danger',
        confirmText: options.confirmText,
        cancelText: options.cancelText || 'Cancel',
        children: options.children || null,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const Component = useCallback(
    () => (
      <ConfirmDialog
        open={state.open}
        title={state.title}
        description={state.description}
        variant={state.variant}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        onClose={handleClose}
        onConfirm={handleConfirm}
      >
        {state.children}
      </ConfirmDialog>
    ),
    [state, handleClose, handleConfirm]
  );

  return [Component, confirm];
}

export default ConfirmDialog;
