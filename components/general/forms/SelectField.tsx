'use client';

import type { SelectOption } from './formFieldTypes';
import { INPUT_CLASS } from './formFieldStyles';

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string; // shown as a disabled first option, e.g. "Choose one..."
  className?: string;
};

export default function SelectField({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: SelectFieldProps) {
  return (
    <select
      className={`${INPUT_CLASS} ${className}`.trim()}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {/* Placeholder is unselectable — it just prompts the user to pick */}
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}

      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
