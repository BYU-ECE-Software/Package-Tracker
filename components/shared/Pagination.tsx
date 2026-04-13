'use client';

import React from 'react';
import type { PaginationProps } from '@/types/pagination';

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  pagination,
  onPageChange,
  setPageSize,
}) => {
  const totalPages = Math.ceil(totalItems / pagination.pageSize);
  const { currentPage, pageSize } = pagination;

  const [inputPage, setInputPage] = React.useState('');

  const handleClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pageNumbers.push(
          <button
            key={i}
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
      } else if (pageNumbers[pageNumbers.length - 1] !== 'ellipsis') {
        pageNumbers.push(
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
        );
        pageNumbers.push('ellipsis');
      }
    }

    return pageNumbers.filter((el) => el !== 'ellipsis');
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center mt-6 gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md text-sm bg-white border border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white transition disabled:opacity-40"
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md text-sm bg-white border border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white transition disabled:opacity-40"
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
              }
            }
          }}
          className="w-20 border border-byu-navy text-byu-navy rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byu-navy"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-byu-navy font-normal">
          Packages per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            onPageChange(1);
          }}
          className="border border-byu-navy text-byu-navy bg-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byu-navy transition"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;