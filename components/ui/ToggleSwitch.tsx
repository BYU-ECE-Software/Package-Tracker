'use client';

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  className = '',
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition focus:ring-2 focus:ring-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-byu-royal' : 'bg-gray-300'
      } ${className}`}
    >
      <span className="sr-only">{checked ? 'On' : 'Off'}</span>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
