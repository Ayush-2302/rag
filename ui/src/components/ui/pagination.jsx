import React from 'react';
import { cn } from '../../lib/design-system/cn';
import { Button } from './button';

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showInfo = true,
  className = '',
}) {
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className={cn('flex items-center justify-between gap-4 select-none', className)}>
      {showInfo && (
        <span className="text-xs text-text-muted">
          Page <strong className="font-semibold text-text-primary">{currentPage}</strong> of{' '}
          <strong className="font-semibold text-text-primary">{totalPages}</strong>
        </span>
      )}
      <div className="flex items-center gap-1.5 ml-auto">
        <Button
          variant="secondary"
          size="xs"
          disabled={!canPrev}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="xs"
          disabled={!canNext}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
