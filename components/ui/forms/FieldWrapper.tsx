// IDENTICAL to Template-Repo: components/general/forms/FieldWrapper.tsx
'use client';

import type { ReactNode } from 'react';
import { ERROR_CLASS, LABEL_CLASS } from './formFieldStyles';

type FieldWrapperProps = {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  children: ReactNode;
};

export default function FieldWrapper({
  label,
  required = false,
  helperText,
  error,
  className = '',
  labelClassName = 'flex flex-wrap items-baseline gap-x-2 gap-y-1',
  helperTextClassName = 'text-xs font-normal text-gray-500 mb-2',
  children,
}: FieldWrapperProps) {
  return (
    <div className={`${className} row-span-3 grid grid-rows-subgrid pb-6`}>
      {/* Row 1: label + inline helper text */}
      <label className={labelClassName}>
        <span className={LABEL_CLASS}>
          {label} {required ? '*' : null}
        </span>
        {helperText ? <span className={helperTextClassName}>{helperText}</span> : null}
      </label>

      {/* Row 2: nothing (spacer so inputs align even when neighbor has no helper text) */}
      <div />

      {/* Row 3: the actual input */}
      <div>
        {children}
        {error ? <p className={ERROR_CLASS}>{error}</p> : null}
      </div>
    </div>
  );
}
