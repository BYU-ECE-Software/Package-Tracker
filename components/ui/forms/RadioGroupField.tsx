// IDENTICAL to Template-Repo: components/general/forms/RadioGroupField.tsx
'use client';

import type { RadioOption } from './formFieldTypes';

type RadioGroupFieldProps = {
  name: string; // must be unique per group so browsers group the radio buttons correctly
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  options: RadioOption[];
};

export default function RadioGroupField({ name, value, onChange, options }: RadioGroupFieldProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={String(opt.value)} className="flex items-center gap-2">
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span className="text-byu-navy text-sm">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
