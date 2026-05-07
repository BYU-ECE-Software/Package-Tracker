'use client';

import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import type { InputHTMLAttributes } from 'react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  widthClass?: string; // like "w-full sm:w-80"
  type?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'placeholder'>;

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  widthClass = 'w-full sm:w-80',
  type = 'search',
  ...inputProps
}: SearchBarProps) {
  return (
    <div className={`relative ${widthClass}`}>
      {/* magnifying glass */}
      <HiOutlineMagnifyingGlass
        className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type={type}
        placeholder={placeholder}
        className="border-byu-navy focus:ring-byu-navy focus:border-byu-navy w-full rounded-lg border py-2 pr-3 pl-10 text-sm focus:ring-1 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
    </div>
  );
}
