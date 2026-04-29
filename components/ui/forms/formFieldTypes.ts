// MODIFIED from Template-Repo: components/general/forms/formFieldTypes.ts
// Worth upstreaming. Local additions:
//   - `CheckboxField` kind for boolean form fields. Sibling to SelectField/
//     RadioField rather than an `InputField` type variant because checkboxes
//     carry boolean values and don't share the input-field props (placeholder,
//     inputMode, etc.). Paired with components/ui/forms/CheckboxField.tsx.
//   - `ComboboxField` kind for searchable select with create-on-enter
//     affordance. Paired with components/ui/forms/Combobox.tsx. Value shape
//     in the form values object is `{ id: string; name: string }`.

import type { HTMLAttributes, ReactNode } from 'react';
import type { ComboboxItem } from '@/components/ui/forms/Combobox';

// An adornment is a small label inside the input, like a "$" prefix
export type Adornment = {
  text: string;
  position: 'start' | 'end';
};

export type SelectOption = {
  label: string;
  value: string;
};

export type RadioOption = {
  label: string;
  value: string | number | boolean; // supports Yes/No booleans, numeric codes, or string values
};

// All field types share these base properties
export type BaseField = {
  key: string; // must match the key in your form values object
  label: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  colSpan?: 1 | 2; // use 2 to make this field take the full row width
  adornment?: Adornment;
};

export type InputFieldType = 'text' | 'email' | 'number' | 'date' | 'textarea' | 'file' | 'pin';

export type InputField = BaseField & {
  kind?: 'input';
  type?: InputFieldType;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  accept?: string; // only used when type is 'file', e.g. '.pdf,.png'
};

export type SelectField = BaseField & {
  kind: 'select';
  options: SelectOption[];
};

export type RadioField = BaseField & {
  kind: 'radio';
  options: RadioOption[];
};

export type CheckboxField = BaseField & {
  kind: 'checkbox';
};

export type ComboboxField = BaseField & {
  kind: 'combobox';
  items: ComboboxItem[];
};

// Custom fields let you render anything inside the form grid
export type CustomField<TItem = any> = {
  kind: 'custom';
  key: string;
  colSpan?: 1 | 2;
  render: (args?: {
    value?: any;
    setValue?: (value: any) => void;
    item?: TItem;
    itemIndex?: number;
  }) => ReactNode;
};

// Union of all supported field types — used by FormModal and FullPageForm
export type SharedFormField<TItem = any> =
  | InputField
  | SelectField
  | RadioField
  | CheckboxField
  | ComboboxField
  | CustomField<TItem>;
