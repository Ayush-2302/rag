import React from 'react';
import { Input } from './input';
import { SearchIcon, XIcon } from '../icons';

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search…',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <div className="relative w-full">
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size={size}
        leftIcon={<SearchIcon size={15} />}
        className={className}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:text-text-primary"
          aria-label="Clear search"
        >
          <XIcon size={12} />
        </button>
      )}
    </div>
  );
}
