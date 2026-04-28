'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import type { DropdownEntity } from '@/types/dropdown';
import { INPUT_CLASS } from '@/components/ui/forms/formFieldStyles';

export type DropdownComboboxValue = {
  id: string;
  name: string;
};

type Props = {
  items: DropdownEntity[];
  value: DropdownComboboxValue;
  onChange: (next: DropdownComboboxValue) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function DropdownCombobox({
  items,
  value,
  onChange,
  placeholder = 'Select or type to add new…',
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const query = value.name.trim().toLowerCase();
  const filtered = query
    ? items.filter((it) => it.name.toLowerCase().includes(query))
    : items;

  const exactMatch = items.find(
    (it) => it.name.toLowerCase() === query,
  );
  const showCreateRow = !!query && !exactMatch;

  useEffect(() => {
    setHighlight(0);
  }, [value.name, isOpen]);

  const select = (item: DropdownEntity) => {
    onChange({ id: item.id, name: item.name });
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const rowCount = filtered.length + (showCreateRow ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (rowCount > 0) setHighlight((h) => (h + 1) % rowCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (rowCount > 0) setHighlight((h) => (h - 1 + rowCount) % rowCount);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlight < filtered.length) {
          select(filtered[highlight]);
        } else if (showCreateRow) {
          // Keep typed name, clear id — parent will create on submit.
          setIsOpen(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value.name}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => {
          onChange({ id: '', name: e.target.value });
          setIsOpen(true);
        }}
        onFocus={() => !disabled && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className={`${INPUT_CLASS} pr-9`}
      />

      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onMouseDown={(e) => {
          e.preventDefault();
          if (disabled) return;
          setIsOpen((prev) => !prev);
          inputRef.current?.focus();
        }}
        aria-label="Toggle options"
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronDownIcon className="h-5 w-5" />
      </button>

      {isOpen && !disabled && (filtered.length > 0 || showCreateRow) && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setHighlight(index)}
              onClick={() => select(item)}
              className={`block w-full px-3 py-2 text-left text-sm transition ${
                highlight === index
                  ? 'bg-byu-royal/10 text-byu-navy'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.name}
            </button>
          ))}

          {showCreateRow && (
            <div
              onMouseEnter={() => setHighlight(filtered.length)}
              className={`px-3 py-2 text-sm transition ${
                highlight === filtered.length
                  ? 'bg-byu-royal/10 text-byu-navy'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-xs text-gray-500">Create new </span>
              <span className="font-medium">“{value.name.trim()}”</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
