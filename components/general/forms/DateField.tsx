// Date-native form field. Internalizes the form-string ↔ Date conversion
// so callers store Dates in state and never need parseFormDate/toFormDate
// at the boundary. Pair with formatDate / daysAgo for display.
'use client';

import { INPUT_CLASS, INPUT_CLASS_NO_TEXT_COLOR } from './formFieldStyles';
import { parseFormDate, toFormDate } from '@/utils/parseFormDate';

interface DateFieldProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  /** Set false inside FormModal where the parent controls text color. */
  includeTextColor?: boolean;
  className?: string;
  id?: string;
}

export default function DateField({
  value,
  onChange,
  disabled = false,
  includeTextColor = true,
  className,
  id,
}: DateFieldProps) {
  const baseClassRaw = includeTextColor ? INPUT_CLASS : INPUT_CLASS_NO_TEXT_COLOR;
  const disabledClass = disabled ? ' bg-gray-50 text-gray-500 cursor-not-allowed' : '';
  const fieldClass = [baseClassRaw + disabledClass, className].filter(Boolean).join(' ');

  return (
    <input
      id={id}
      type="date"
      className={fieldClass}
      value={value ? toFormDate(value) : ''}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v ? parseFormDate(v) : null);
      }}
      disabled={disabled}
    />
  );
}
