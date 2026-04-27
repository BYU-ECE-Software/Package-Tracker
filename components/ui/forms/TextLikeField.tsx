// IDENTICAL to Template-Repo: components/general/forms/TextLikeField.tsx
'use client';

import { INPUT_CLASS, INPUT_CLASS_NO_TEXT_COLOR } from './formFieldStyles';
import type { HTMLAttributes } from 'react';

type TextLikeFieldProps = {
  as?: 'input' | 'textarea';
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  adornment?: {
    text: string;
    position: 'start' | 'end';
  };
  includeTextColor?: boolean; // set false inside FormModal where the parent controls text color
};

export default function TextLikeField({
  as = 'input',
  type = 'text',
  value,
  onChange,
  placeholder,
  rows = 3,
  inputMode,
  adornment,
  includeTextColor = true,
}: TextLikeFieldProps) {
  const hasAdornment = Boolean(adornment?.text);
  const adornPos = adornment?.position ?? 'start';

  // Shift the input's padding so text doesn't overlap the adornment label
  const inputPaddingClass = hasAdornment
    ? adornPos === 'start'
      ? 'pl-7 pr-3'
      : 'pl-3 pr-7'
    : 'px-3';

  const baseClass = includeTextColor ? INPUT_CLASS : INPUT_CLASS_NO_TEXT_COLOR;

  const fieldClass = [baseClass.replace('px-3 ', ''), 'py-2', inputPaddingClass].join(' ');

  // Adornment sits differently on textareas (top-aligned) vs single-line inputs (vertically centered)
  const adornmentClass =
    as === 'textarea'
      ? [
          'pointer-events-none absolute top-3 text-sm text-gray-500',
          adornPos === 'start' ? 'left-3' : 'right-3',
        ].join(' ')
      : [
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-gray-500',
          adornPos === 'start' ? 'left-3' : 'right-3',
        ].join(' ');

  return (
    <div className={hasAdornment ? 'relative' : undefined}>
      {hasAdornment ? <span className={adornmentClass}>{adornment?.text}</span> : null}

      {as === 'textarea' ? (
        <textarea
          rows={rows}
          className={fieldClass}
          placeholder={placeholder ?? ''}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className={hasAdornment ? fieldClass : baseClass}
          placeholder={placeholder ?? ''}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode}
        />
      )}
    </div>
  );
}
