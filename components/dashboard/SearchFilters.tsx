'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import SearchBar from '@/components/ui/SearchBar';
import type { DropdownEntity } from '@/types/dropdown';

export type SearchFiltersState = {
  searchTerm: string;
  activeOnly: boolean;
  date: string;
  carrierId: string;
  senderId: string;
};

interface SearchFiltersProps {
  carriers: DropdownEntity[];
  senders: DropdownEntity[];
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: {
    activeOnly: boolean;
    date: string;
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
  const [date, setDate] = useState('');
  const [carrierId, setCarrierId] = useState('');
  const [senderId, setSenderId] = useState('');

  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const activeFilterCount = [date, carrierId, senderId].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search packages…"
      />

      {/* Active Only Checkbox */}
      <label className="flex items-center gap-2 text-sm text-byu-navy cursor-pointer">
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={(e) => setActiveOnly(e.target.checked)}
          className="h-4 w-4 text-byu-royal rounded"
        />
        Show active packages only
      </label>

      {/* Advanced Filters Toggle */}
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
          Advanced filters
          {activeFilterCount > 0 && (
            <span className="ml-1 rounded-full bg-byu-royal text-white px-1.5 py-0.5 text-[10px] leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        {filtersOpen && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
            {/* Date Filter */}
            <div className="flex items-center gap-3 text-sm">
              <label htmlFor="filter-date" className="text-byu-navy w-24">
                Arrived on:
              </label>
              <input
                id="filter-date"
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

            {/* Carrier Filter */}
            <div className="flex items-center gap-3 text-sm">
              <label htmlFor="filter-carrier" className="text-byu-navy w-24">
                Carrier:
              </label>
              <select
                id="filter-carrier"
                value={carrierId}
                onChange={(e) => setCarrierId(e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              >
                <option value="">All carriers</option>
                {carriers
                  .filter((c) => c.isActive)
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
            <div className="flex items-center gap-3 text-sm">
              <label htmlFor="filter-sender" className="text-byu-navy w-24">
                Sender:
              </label>
              <select
                id="filter-sender"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
              >
                <option value="">All senders</option>
                {senders
                  .filter((s) => s.isActive)
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
    </div>
  );
}