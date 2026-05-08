'use client';

import { useEffect, useRef, useState } from 'react';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import SearchBar from '@/components/general/data-display/SearchBar';
import DateField from '@/components/general/forms/DateField';
import type { DropdownEntity } from '@/types/general/DropdownEntity';

export type SearchFiltersState = {
  searchTerm: string;
  activeOnly: boolean;
  date: Date | null;
  carrierId: string;
  senderId: string;
};

interface SearchFiltersProps {
  carriers: DropdownEntity[];
  senders: DropdownEntity[];
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: {
    activeOnly: boolean;
    date: Date | null;
    carrierId: string;
    senderId: string;
  }) => void;
}

export default function SearchFilters({
  carriers,
  senders,
  onSearchChange,
  onFiltersChange,
}: SearchFiltersProps) {
  // Search state (with debouncing)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [activeOnly, setActiveOnly] = useState(true);
  const [date, setDate] = useState<Date | null>(null);
  const [carrierId, setCarrierId] = useState('');
  const [senderId, setSenderId] = useState('');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Notify parent when debounced search changes
  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange({ activeOnly, date, carrierId, senderId });
  }, [activeOnly, date, carrierId, senderId, onFiltersChange]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!filtersOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [filtersOpen]);

  const activeFilterCount = [date, carrierId, senderId].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Active Only */}
      <label className="flex items-center gap-2 text-sm text-byu-navy cursor-pointer whitespace-nowrap">
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={(e) => setActiveOnly(e.target.checked)}
          className="h-4 w-4 text-byu-royal rounded"
        />
        Show active packages only
      </label>

      {/* Advanced Filters — icon button + dropdown */}
      <div ref={filterRef} className="relative">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={filtersOpen}
          aria-label="Advanced filters"
          className="relative inline-flex items-center justify-center rounded-md border border-byu-navy p-2 text-byu-navy hover:bg-gray-50 cursor-pointer"
        >
          <HiOutlineAdjustmentsHorizontal className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 rounded-full bg-byu-royal text-white px-1.5 py-0.5 text-[10px] leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        {filtersOpen && (
          <div
            role="menu"
            className="absolute left-1/2 -translate-x-1/2 z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg space-y-3"
          >
            {/* Date Filter */}
            <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-2 text-sm">
              <label htmlFor="filter-date" className="text-byu-navy">
                Arrived on:
              </label>
              <DateField
                id="filter-date"
                value={date}
                onChange={setDate}
                className="w-full min-w-0"
              />
              {date && (
                <button
                  type="button"
                  onClick={() => setDate(null)}
                  className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Carrier Filter */}
            <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-2 text-sm">
              <label htmlFor="filter-carrier" className="text-byu-navy">
                Carrier:
              </label>
              <select
                id="filter-carrier"
                value={carrierId}
                onChange={(e) => setCarrierId(e.target.value)}
                className="w-full min-w-0 rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              >
                <option value="">All carriers</option>
                {carriers
                  .filter((c) => !c.hidden)
                  .map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.name}
                    </option>
                  ))}
              </select>
              {carrierId && (
                <button
                  type="button"
                  onClick={() => setCarrierId('')}
                  className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sender Filter */}
            <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-2 text-sm">
              <label htmlFor="filter-sender" className="text-byu-navy">
                Sender:
              </label>
              <select
                id="filter-sender"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className="w-full min-w-0 rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              >
                <option value="">All senders</option>
                {senders
                  .filter((s) => !s.hidden)
                  .map((sender) => (
                    <option key={sender.id} value={sender.id}>
                      {sender.name}
                    </option>
                  ))}
              </select>
              {senderId && (
                <button
                  type="button"
                  onClick={() => setSenderId('')}
                  className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar (right) */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search packages…"
        widthClass="w-full sm:w-80"
      />
    </div>
  );
}
