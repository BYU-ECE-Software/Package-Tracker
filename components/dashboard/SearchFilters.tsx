'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface SearchFiltersProps {
  date: string;
  setDate: (value: string) => void;
}

export default function SearchFilters({
  date,
  setDate,
}: SearchFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = date ? 1 : 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs text-byu-navy hover:underline cursor-pointer"
      >
        {filtersOpen ? (
          <FiChevronUp className="h-3 w-3" />
        ) : (
          <FiChevronDown className="h-3 w-3" />
        )}
        Advanced search filters
        {activeFilterCount > 0 && (
          <span className="ml-1 rounded-full bg-byu-royal text-white px-1.5 py-0.5 text-[10px] leading-none">
            {activeFilterCount}
          </span>
        )}
      </button>

      {filtersOpen && (
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-700">
          <label htmlFor="search-date" className="text-byu-navy">
            Arrived on:
          </label>
          <input
            id="search-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
          />
          {date && (
            <button
              type="button"
              onClick={() => setDate('')}
              className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}