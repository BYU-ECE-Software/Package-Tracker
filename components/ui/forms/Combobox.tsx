// NOT IN Template-Repo — built locally; candidate for upstreaming.
// Generic searchable select with a "create new" affordance: type to filter,
// pick with arrow keys / Enter, or hit Enter on a non-matching query to keep
// the typed text and let the parent handle creation on submit.
//
// Value shape is { id, name }. While `id` is empty, the input shows whatever
// the user is typing; once an item is chosen, the input mirrors the selection
// and re-focusing pre-selects the text so the user can replace it without
// manually clearing first.
'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { INPUT_CLASS } from '@/components/ui/forms/formFieldStyles';

export type ComboboxItem = {
  id: string;
  name: string;
};

export type ComboboxValue = {
  id: string;
  name: string;
};

type Props<T extends ComboboxItem> = {
  items: T[];
  value: ComboboxValue;
  onChange: (next: ComboboxValue) => void;
  placeholder?: string;
  disabled?: boolean;
};

type Position = { top: number; left: number; width: number };

export default function Combobox<T extends ComboboxItem>({
  items,
  value,
  onChange,
  placeholder = 'Select or type to add new…',
  disabled = false,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [position, setPosition] = useState<Position | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Once an item is selected (value.id set), input text mirrors the selection,
  // so we don't want to filter by it — that would trap the user with a list of
  // one. Treat selection as "no query" until they actually type, which clears
  // the id.
  const query = value.id ? '' : value.name.trim().toLowerCase();
  const filtered = query
    ? items.filter((it) => it.name.toLowerCase().includes(query))
    : items;

  const exactMatch = items.find((it) => it.name.toLowerCase() === query);
  const showCreateRow = !!query && !exactMatch;

  // Click outside closes — but only if the click is outside *both* the input
  // wrapper and the portaled dropdown.
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        wrapperRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Reposition the portaled dropdown anytime layout could shift.
  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    setHighlight(0);
  }, [value.name, isOpen]);

  const select = (item: T) => {
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

  const showDropdown =
    isOpen && !disabled && (filtered.length > 0 || showCreateRow) && position;

  const dropdownContent = showDropdown ? (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position!.top,
        left: position!.left,
        width: position!.width,
      }}
      className="z-[55] max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
    >
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
        <button
          type="button"
          onMouseEnter={() => setHighlight(filtered.length)}
          onClick={() => {
            setIsOpen(false);
            inputRef.current?.blur();
          }}
          className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition ${
            highlight === filtered.length
              ? 'bg-byu-royal/10 text-byu-navy'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="text-xs text-gray-500">Create new </span>
          <span className="font-medium">&ldquo;{value.name.trim()}&rdquo;</span>
        </button>
      )}
    </div>
  ) : null;

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
        onFocus={(e) => {
          if (disabled) return;
          setIsOpen(true);
          if (value.id) e.target.select();
        }}
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

      {typeof document !== 'undefined' && dropdownContent
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  );
}
