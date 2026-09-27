/**
 * Centralized Status Configuration for the Design System.
 * Maps application statuses to semantic tokens and visual treatments.
 */

export const STATUS_CONFIG = {
  TODO: {
    key: 'TODO',
    label: 'Todo',
    variant: 'secondary',
    dotColor: 'bg-secondary',
    badgeClass: 'bg-secondary-soft text-text-secondary border-border',
  },
  IN_PROGRESS: {
    key: 'IN_PROGRESS',
    label: 'In Progress',
    variant: 'primary',
    dotColor: 'bg-primary',
    badgeClass: 'bg-primary-soft text-primary border-primary/20',
  },
  REVIEW: {
    key: 'REVIEW',
    label: 'In Review',
    variant: 'warning',
    dotColor: 'bg-warning',
    badgeClass: 'bg-warning-soft text-warning border-warning/20',
  },
  COMPLETED: {
    key: 'COMPLETED',
    label: 'Completed',
    variant: 'success',
    dotColor: 'bg-success',
    badgeClass: 'bg-success-soft text-success border-success/20',
  },
  BLOCKED: {
    key: 'BLOCKED',
    label: 'Blocked',
    variant: 'danger',
    dotColor: 'bg-danger',
    badgeClass: 'bg-danger-soft text-danger border-danger/20',
  },
  CANCELLED: {
    key: 'CANCELLED',
    label: 'Cancelled',
    variant: 'secondary',
    dotColor: 'bg-text-disabled',
    badgeClass: 'bg-surface-soft text-text-muted border-border',
  },
  ON_HOLD: {
    key: 'ON_HOLD',
    label: 'On Hold',
    variant: 'warning',
    dotColor: 'bg-warning',
    badgeClass: 'bg-warning-soft text-warning border-warning/20',
  },

  // Operational / System statuses
  OPERATIONAL: {
    key: 'OPERATIONAL',
    label: 'Operational',
    variant: 'success',
    dotColor: 'bg-success',
    badgeClass: 'bg-success-soft text-success border-success/20',
  },
  READY: {
    key: 'READY',
    label: 'Ready',
    variant: 'success',
    dotColor: 'bg-success',
    badgeClass: 'bg-success-soft text-success border-success/20',
  },
  CONNECTED: {
    key: 'CONNECTED',
    label: 'Connected',
    variant: 'success',
    dotColor: 'bg-success',
    badgeClass: 'bg-success-soft text-success border-success/20',
  },
  LOADING: {
    key: 'LOADING',
    label: 'Checking…',
    variant: 'warning',
    dotColor: 'bg-warning',
    badgeClass: 'bg-warning-soft text-warning border-warning/20',
  },
  UNAVAILABLE: {
    key: 'UNAVAILABLE',
    label: 'Unavailable',
    variant: 'danger',
    dotColor: 'bg-danger',
    badgeClass: 'bg-danger-soft text-danger border-danger/20',
  },
  OFFLINE: {
    key: 'OFFLINE',
    label: 'Offline',
    variant: 'danger',
    dotColor: 'bg-danger',
    badgeClass: 'bg-danger-soft text-danger border-danger/20',
  },
  EMPTY: {
    key: 'EMPTY',
    label: 'Empty',
    variant: 'warning',
    dotColor: 'bg-warning',
    badgeClass: 'bg-warning-soft text-warning border-warning/20',
  },
  SUGGESTED: {
    key: 'SUGGESTED',
    label: 'Action suggested',
    variant: 'warning',
    dotColor: 'bg-warning',
    badgeClass: 'bg-warning-soft text-warning border-warning/20',
  },
};

/**
 * Normalizes any status key/string into a matching config entry with fallback.
 */
export function getStatusConfig(statusKey) {
  if (!statusKey) return STATUS_CONFIG.TODO;
  const normalized = String(statusKey).toUpperCase().replace(/[\s-]/g, '_');
  return STATUS_CONFIG[normalized] || {
    key: normalized,
    label: statusKey,
    variant: 'secondary',
    dotColor: 'bg-secondary',
    badgeClass: 'bg-surface-soft text-text-secondary border-border',
  };
}
