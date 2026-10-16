import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 24, 36, 48],
  className = '',
}: PaginationProps) {
  const [jumpInput, setJumpInput] = useState('');
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setJumpInput('');
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-sm text-[var(--color-text-secondary)] ${className}`}
    >
      {/* Left: Summary and Page Size */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs">
          Showing{' '}
          <strong className="text-[var(--color-text)] tabular-nums font-mono font-bold">
            {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </strong>{' '}
          to{' '}
          <strong className="text-[var(--color-text)] tabular-nums font-mono font-bold">
            {Math.min(currentPage * pageSize, totalItems)}
          </strong>{' '}
          of{' '}
          <strong className="text-[var(--color-text)] tabular-nums font-mono font-bold">
            {totalItems.toLocaleString()}
          </strong>{' '}
          Pokémon
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--color-text-muted)]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1 text-[var(--color-text)] text-xs font-semibold focus:outline-none focus:border-[#E53935] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Controls & Page buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* First page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
          className="p-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[#E53935] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[#E53935] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-[var(--color-text-muted)] font-mono text-xs">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={`min-w-8 h-8 px-2.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-[var(--color-border)]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[#E53935] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
          className="p-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[#E53935] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>

        {/* Direct Jump Input */}
        <form onSubmit={handleJumpSubmit} className="hidden lg:flex items-center gap-1 ml-2">
          <span className="text-xs text-[var(--color-text-muted)]">Go:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            placeholder={`${currentPage}`}
            className="w-14 px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs font-mono font-bold text-[var(--color-text)] text-center focus:outline-none focus:border-[#E53935]"
          />
        </form>
      </div>
    </div>
  );
}
