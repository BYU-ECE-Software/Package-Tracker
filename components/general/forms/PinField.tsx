'use client';

import { FiEye, FiEyeOff } from 'react-icons/fi';
import { INPUT_CLASS } from './formFieldStyles';

type PinFieldProps = {
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder?: string;
  showTitle?: boolean; // shows "Show"/"Hide" tooltip on the toggle button
};

export default function PinField({
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
  showTitle = false,
}: PinFieldProps) {
  // Strip anything that isn't a digit so only numbers can be entered
  const sanitizePin = (raw: string) => raw.replace(/\D/g, '');

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        className={INPUT_CLASS + ' pr-10'}
        placeholder={placeholder ?? ''}
        value={value}
        onChange={(e) => onChange(sanitizePin(e.target.value))}
        inputMode="numeric"
        autoComplete="one-time-code"
      />

      {/* Toggle button to show or hide the PIN */}
      <button
        type="button"
        onClick={onToggleVisible}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-gray-700"
        aria-label={visible ? 'Hide PIN' : 'Show PIN'}
        title={showTitle ? (visible ? 'Hide' : 'Show') : undefined}
      >
        {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
      </button>
    </div>
  );
}
