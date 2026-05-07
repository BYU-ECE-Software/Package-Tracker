// Generic checkbox input matching the form-field family pattern, alongside
// SelectField / TextLikeField / RadioGroupField. Pairs with the 'checkbox'
// kind in formFieldTypes so FormModal can render it via config.
'use client';

type CheckboxFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export default function CheckboxField({
  checked,
  onChange,
  label,
  disabled = false,
}: CheckboxFieldProps) {
  // If no label, render just the input (used inside FieldWrapper which owns the label)
  if (!label) {
    return (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 text-byu-royal focus:ring-byu-royal disabled:opacity-50"
      />
    );
  }

  // With label, wrap in a label element for clickability
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 text-byu-royal focus:ring-byu-royal disabled:opacity-50 cursor-pointer"
      />
      <span className="text-sm font-medium text-gray-700 select-none">
        {label}
      </span>
    </label>
  );
}
