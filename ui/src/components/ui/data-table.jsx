import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/design-system/cn';
import { SearchInput } from './search-input';
import { SkeletonRows } from './skeleton';
import { EmptyState } from './empty-state';
import { Pagination } from './pagination';

export function Th({
  sortable = false,
  active = false,
  direction = 'asc',
  onClick,
  className = '',
  children,
}) {
  if (!sortable) {
    return (
      <th
        className={cn(
          'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted select-none',
          className
        )}
      >
        {children}
      </th>
    );
  }

  return (
    <th className={cn('px-4 py-3 text-left', className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider select-none transition-colors',
          active ? 'text-primary' : 'text-text-muted hover:text-text-primary'
        )}
      >
        <span>{children}</span>
        <span className={cn('text-xs leading-none transition-opacity', active ? 'opacity-100' : 'opacity-30')}>
          {direction === 'asc' ? '▲' : '▼'}
        </span>
      </button>
    </th>
  );
}

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  emptyDescription = 'There are no items to display.',
  searchable = false,
  searchPlaceholder = 'Filter records…',
  pageSize = 10,
  onRowClick,
  className = '',
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) => val && String(val).toLowerCase().includes(lower)
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  return (
    <div className={cn('space-y-3', className)}>
      {searchable && (
        <div className="flex items-center justify-between gap-3">
          <div className="w-72">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={() => setSearch('')}
              placeholder={searchPlaceholder}
              size="sm"
            />
          </div>
          <span className="text-xs text-text-muted">
            {sortedData.length} item{sortedData.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-soft">
              <tr>
                {columns.map((col) => (
                  <Th
                    key={col.key || col.title}
                    sortable={col.sortable}
                    active={sortKey === col.key}
                    direction={sortDir}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={col.headerClassName}
                  >
                    {col.title}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <SkeletonRows rows={4} cols={columns.length} />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12">
                    <EmptyState
                      title={emptyMessage}
                      description={emptyDescription}
                      compact
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'transition-colors hover:bg-surface-hover/60',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key || col.title}
                        className={cn('px-4 py-3 text-text-secondary', col.className)}
                      >
                        {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-border-light bg-surface-soft/40 px-4 py-2.5">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
