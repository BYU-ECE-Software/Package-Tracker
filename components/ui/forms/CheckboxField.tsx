// NOT IN Template-Repo — built locally and worth upstreaming.
// Generic checkbox input matching the form-field family pattern, alongside
// SelectField / TextLikeField / RadioGroupField. Pairs with the new
// 'checkbox' kind in formFieldTypes so FormModal can render it via config.
'use client';

type CheckboxFieldProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function CheckboxField({
  checked,
  onChange,
  disabled = false,
}: CheckboxFieldProps) {
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
