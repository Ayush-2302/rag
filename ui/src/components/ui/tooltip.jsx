import React, { useState } from 'react';
import { cn } from '../../lib/design-system/cn';

export function Tooltip({
  content,
  position = 'top', // 'top' | 'bottom'
  delay = 200,
  children,
  className = '',
}) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(null);

  const show = () => {
    const t = setTimeout(() => setVisible(true), delay);
    setTimer(t);
  };

  const hide = () => {
    if (timer) clearTimeout(timer);
    setVisible(false);
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded bg-text-primary px-2 py-1 text-xs font-medium text-text-inverse shadow-md animate-fade-in',
            position === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
            position === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-1.5'
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
