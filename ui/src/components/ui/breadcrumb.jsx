import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/design-system/cn';
import { ChevronRightIcon } from '../icons';

export function Breadcrumb({ items = [], className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-text-muted', className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRightIcon size={12} className="text-text-disabled" />}
              {isLast || !item.to ? (
                <span className={cn('font-medium', isLast ? 'text-text-primary' : 'text-text-muted')}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-primary transition-colors font-medium text-text-muted"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
