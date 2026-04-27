// MODIFIED from Template-Repo: components/general/data-display/Pagination.tsx
// Worth upstreaming. Improvements over the template:
//   - Cleaner API: takes a `pagination` object + `totalItems` instead of three
//     separate props; computes totalPages internally so callers don't have to.
//   - Same safety/a11y as the template (aria-current, blur-commit input, hide
//     when nothing to paginate, defensive totalPages clamp).
//   - Same configurability (itemLabel, pageSizeOptions, delta, className).
'use client';

import { useState } from 'react';
import type { PaginationProps } from '@/types/pagination';

// ─── Component ────────────────────────────────────────────────────────────────

export default function Pagination({
  totalItems,
  pagination,
  onPageChange,
  setPageSize,
  itemLabel = 'Items',
  pageSizeOptions = [10, 25, 50, 100],
  delta = 1,
  className = '',
}: PaginationProps) {
  const { currentPage, pageSize } = pagination;
  const totalPages = Math.ceil(totalItems / pageSize);
  const safeTotalPages = Math.max(1, totalPages);

  const [inputPage, setInputPage] = useState('');

  const goTo = (page: number) => {
    if (!Number.isFinite(page)) return;
    const clamped = Math.max(1, Math.min(safeTotalPages, page));
    if (clamped !== currentPage) onPageChange(clamped);
  };

  const commitInput = () => {
    if (!inputPage.trim()) return;
    const n = Number(inputPage);
    if (!Number.isFinite(n)) return;
    goTo(n);
    setInputPage('');
  };

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    let lastWasEllipsis = false;

    for (let i = 1; i <= safeTotalPages; i++) {
      const inRange =
        i === 1 ||
        i === safeTotalPages ||
        (i >= currentPage - delta && i <= currentPage + delta);

      if (inRange) {
        lastWasEllipsis = false;
        pages.push(
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-current={currentPage === i ? 'page' : undefined}
            className={`px-3 py-1 rounded-md text-sm border transition ${
              currentPage === i
                ? 'bg-byu-navy text-white border-byu-navy font-semibold'
                : 'bg-white border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white'
            }`}
          >
            {i}
          </button>
        );
      } else if (!lastWasEllipsis) {
        lastWasEllipsis = true;
        pages.push(
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 select-none">
            ...
          </span>
        );
      }
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col md:flex-row justify-center items-center mt-6 gap-4 flex-wrap ${className}`}
    >
      {totalPages > 1 && (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
              className={buttonClass}
            >
              Previous
            </button>

            {renderPageNumbers()}

            <button
              type="button"
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage === safeTotalPages}
              className={buttonClass}
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="goToPage" className="text-sm text-byu-navy">
              Go to page:
            </label>
            <input
              id="goToPage"
              type="number"
              min={1}
              max={safeTotalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={commitInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitInput();
                if (e.key === 'Escape') setInputPage('');
              }}
              className="w-20 rounded border border-byu-navy px-2 py-1 text-sm text-byu-navy focus:outline-none focus:ring-2 focus:ring-byu-navy"
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-byu-navy">
          {itemLabel} per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded border border-byu-navy bg-white px-3 py-1 text-sm text-byu-navy focus:outline-none focus:ring-2 focus:ring-byu-navy transition"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Shared within file ───────────────────────────────────────────────────────

const buttonClass =
  'px-3 py-1 rounded-md text-sm bg-white border border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white transition disabled:opacity-40';
