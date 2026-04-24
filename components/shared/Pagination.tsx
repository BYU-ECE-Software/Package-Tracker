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
}: PaginationProps & { itemLabel?: string }) {
  const { currentPage, pageSize } = pagination;
  const totalPages = Math.ceil(totalItems / pageSize);
  const [inputPage, setInputPage] = useState('');

  const handleClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    const delta = 1;
    let lastWasEllipsis = false;

    for (let i = 1; i <= totalPages; i++) {
      const inRange =
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta);

      if (inRange) {
        lastWasEllipsis = false;
        pages.push(
          <button
            key={i}
            type="button"
            onClick={() => onPageChange(i)}
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
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center mt-6 gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={buttonClass}
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          type="button"
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
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
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const page = Number(inputPage);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
                setInputPage('');
              }
            }
          }}
          className="w-20 rounded border border-byu-navy px-2 py-1 text-sm text-byu-navy focus:outline-none focus:ring-2 focus:ring-byu-navy"
        />
      </div>

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
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Shared within file ───────────────────────────────────────────────────────

const buttonClass =
  'px-3 py-1 rounded-md text-sm bg-white border border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white transition disabled:opacity-40';