// Generic async-search autocomplete with optional "suggested item" slot.
// Fully generic over T, no app-specific assumptions. Configurable:
//   - disabled: locks input + clear button + dropdown
//   - debounceMs: tune debounce delay (default 300ms)
//   - noResultsMessage / loadingMessage: customize empty + loading copy
//   - initialItems / initialItemsLabel: list of pre-populated suggestions
//     shown when the input is empty and focused (e.g. "frecent" / "popular"
//     items). Coexists with suggestedItem — both render when empty, and
//     keyboard navigation walks across both lists in order.
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
  /**
   * Items to show when the input is empty and focused — useful for "recently
   * used" or "most common" pre-populated suggestions. Renders below
   * suggestedItem (if both are provided).
   */
  initialItems?: T[];
  /** Optional header label shown above the initialItems list. */
  initialItemsLabel?: string;
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
  initialItems,
  initialItemsLabel,
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

  // Fetch results when debounced search changes. setResults / setLoading
  // inside an effect is the right shape for fetch-on-key.
   
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
   

  // Reset highlighted index when results change — using prev-render snapshot
  // pattern instead of an effect to avoid an extra render cycle.
  const [prevResults, setPrevResults] = useState(results);
  if (prevResults !== results) {
    setPrevResults(results);
    setHighlightedIndex(0);
  }

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

  // Flat list of selectable items in current dropdown order. When searching,
  // it's the search results; when empty, it's [suggestedItem?, ...initialItems].
  // Highlight index walks this list so keyboard nav works across both lists.
  const emptyStateItems: T[] = !searchTerm
    ? [
        ...(suggestedItem ? [suggestedItem] : []),
        ...(initialItems ?? []),
      ]
    : [];
  const navItems: T[] = searchTerm ? results : emptyStateItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const itemCount = navItems.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (itemCount > 0) setHighlightedIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (itemCount > 0) setHighlightedIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Enter':
        e.preventDefault();
        if (navItems[highlightedIndex]) {
          handleSelect(navItems[highlightedIndex]);
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
  const showSuggested = !searchTerm && !!suggestedItem;
  const showInitialItems = !searchTerm && !!initialItems && initialItems.length > 0;
  const showResults = searchTerm && results.length > 0;
  const showLoading = searchTerm && loading;
  const showEmpty = searchTerm && !loading && results.length === 0;
  const showDropdown =
    isOpen && !disabled && (showSuggested || showInitialItems || showResults || showLoading || showEmpty);

  // Index offset for initialItems within the unified empty-state nav list.
  const initialItemsOffset = suggestedItem ? 1 : 0;

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
          {showSuggested && suggestedItem && (
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

          {/* Pre-populated initial items (e.g. recently used / most common) */}
          {showInitialItems && (
            <>
              {initialItemsLabel && (
                <div className="px-3 pt-2 pb-1 text-xs font-medium text-gray-500">
                  {initialItemsLabel}
                </div>
              )}
              {initialItems!.map((item, i) => {
                const navIndex = initialItemsOffset + i;
                return (
                  <button
                    key={getKey(item)}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(navIndex)}
                    className={`w-full px-3 py-2 text-left text-sm cursor-pointer transition ${
                      highlightedIndex === navIndex
                        ? 'bg-byu-royal/10 text-byu-navy'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {getLabel(item)}
                  </button>
                );
              })}
            </>
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
