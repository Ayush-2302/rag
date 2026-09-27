/**
 * Centralized Priority Configuration for the Design System.
 * Maps priority levels to semantic tokens.
 */

export const PRIORITY_CONFIG = {
  LOW: {
    key: 'LOW',
    label: 'Low',
    variant: 'secondary',
    dotColor: 'bg-secondary',
    badgeClass: 'bg-secondary-soft text-text-secondary border-border',
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Medium',
    variant: 'info',
    dotColor: 'bg-info',
    badgeClass: 'bg-info-soft text-info border-info/20',
  },
  HIGH: {
    key: 'HIGH',
    label: 'High',
    variant: 'warning',
    dotColor: 'bg-warning',
    badgeClass: 'bg-warning-soft text-warning border-warning/20',
  },
  CRITICAL: {
    key: 'CRITICAL',
    label: 'Critical',
    variant: 'danger',
    dotColor: 'bg-danger',
    badgeClass: 'bg-danger-soft text-danger border-danger/20',
  },
};

export function getPriorityConfig(priorityKey) {
  if (!priorityKey) return PRIORITY_CONFIG.LOW;
  const normalized = String(priorityKey).toUpperCase().replace(/[\s-]/g, '_');
  return PRIORITY_CONFIG[normalized] || PRIORITY_CONFIG.LOW;
}
