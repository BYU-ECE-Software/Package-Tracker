'use client';

import type { ReactNode } from 'react';

type SegmentedControlOption = {
  label?: string;
  icon?: ReactNode;
  value: string;
};

type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function SegmentedControl({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps) {
  return (
    <div className={`inline-flex rounded-xl bg-gray-100 p-1 ${className}`}>
      {options.map((opt, i) => {
        const active = opt.value === value;
        const prevActive = i > 0 && options[i - 1].value === value;
        const showDivider = i > 0 && !active && !prevActive;

        return (
          <div key={opt.value} className="flex items-center">
            {/* Divider between two inactive options */}
            {showDivider && <div className="h-5 w-px bg-gray-300" />}
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                active ? 'bg-byu-royal text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              {opt.label && <span>{opt.label}</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
