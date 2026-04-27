// NOT IN Template-Repo — built locally and worth upstreaming.
// Generic async-search autocomplete with optional "suggested item" slot.
// Fully generic over T, no app-specific assumptions. Configurable:
//   - disabled: locks input + clear button + dropdown
//   - debounceMs: tune debounce delay (default 300ms)
//   - noResultsMessage / loadingMessage: customize empty + loading copy
'use client';

import { useState, useEffect, useRef } from 'react';
import { INPUT_CLASS } from './formFieldStyles';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TypeaheadProps<T> = {
  value: T | null;
  onChange: (item: T | null) => void;
  fetchItems: (query: string) => Promise<T[]>;
  getLabel: (item: T) => string;
  getKey: (item: T) => string | number;
  placeholder?: string;
  suggestedItem?: T; // Shows when empty and focused
  suggestedLabel?: string; // Optional custom label for suggested item (default: "Suggested:")
  className?: string;
  disabled?: boolean;
  /** Debounce delay before firing fetchItems with the user's input (default 300ms). */
  debounceMs?: number;
  /** Copy shown when fetchItems returns no results (default "No results found"). */
  noResultsMessage?: string;
  /** Copy shown while fetchItems is in flight (default "Searching..."). */
  loadingMessage?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Typeahead<T>({
  value,
  onChange,
  fetchItems,
  getLabel,
  getKey,
  placeholder = 'Search...',
  suggestedItem,
  suggestedLabel = 'Suggested:',
  className = '',
  disabled = false,
  debounceMs = 300,
  noResultsMessage = 'No results found',
  loadingMessage = 'Searching...',
}: TypeaheadProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Fetch results when debounced search changes
  useEffect(() => {
    if (!debouncedSearch) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const items = await fetchItems(debouncedSearch);
        setResults(items);
      } catch (error) {
        console.error('Typeahead search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch, fetchItems]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: T) => {
    onChange(item);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const itemCount = searchTerm ? results.length : suggestedItem ? 1 : 0;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchTerm && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        } else if (!searchTerm && suggestedItem && highlightedIndex === 0) {
          handleSelect(suggestedItem);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Determine what to show in dropdown
  const showSuggested = !searchTerm && suggestedItem;
  const showResults = searchTerm && results.length > 0;
  const showLoading = searchTerm && loading;
  const showEmpty = searchTerm && !loading && results.length === 0;
  const showDropdown =
    isOpen && !disabled && (showSuggested || showResults || showLoading || showEmpty);

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value ? getLabel(value) : searchTerm}
          onChange={(e) => {
            if (value) {
              // If there's a selected value, clear it when typing
              onChange(null);
            }
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${INPUT_CLASS} pr-8`}
          autoComplete="off"
          disabled={disabled}
        />

        {/* Clear button — hidden while disabled so users can't fight the lock */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg max-h-60 overflow-auto"
        >
          {/* Suggested item */}
          {showSuggested && (
            <button
              type="button"
              onClick={() => handleSelect(suggestedItem)}
              onMouseEnter={() => setHighlightedIndex(0)}
              className={`w-full px-3 py-2 text-left text-sm cursor-pointer transition ${
                highlightedIndex === 0
                  ? 'bg-byu-royal/10 text-byu-navy'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs text-gray-500 font-medium">
                {suggestedLabel}{' '}
              </span>
              <span className="text-byu-navy font-medium">
                {getLabel(suggestedItem)}
              </span>
            </button>
          )}

          {/* Search results */}
          {showResults &&
            results.map((item, index) => (
              <button
                key={getKey(item)}
                type="button"
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-3 py-2 text-left text-sm cursor-pointer transition ${
                  highlightedIndex === index
                    ? 'bg-byu-royal/10 text-byu-navy'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {getLabel(item)}
              </button>
            ))}

          {/* Loading state */}
          {showLoading && (
            <div className="px-3 py-2 text-sm text-gray-500">{loadingMessage}</div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="px-3 py-2 text-sm text-gray-500">{noResultsMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}
