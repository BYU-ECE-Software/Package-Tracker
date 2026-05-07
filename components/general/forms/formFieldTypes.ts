import type { HTMLAttributes, ReactNode } from 'react';

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

export type ComboboxItem = {
  id: string;
  name: string;
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

// Custom fields let you render anything inside the form grid.
// Custom renderers narrow `value` themselves — they own the field's value shape.
export type CustomField<TItem = unknown> = {
  kind: 'custom';
  key: string;
  colSpan?: 1 | 2;
  render: (args?: {
    value?: unknown;
    setValue?: (value: unknown) => void;
    item?: TItem;
    itemIndex?: number;
  }) => ReactNode;
};

// Union of all supported field types — used by FormModal and FullPageForm
export type SharedFormField<TItem = unknown> =
  | InputField
  | SelectField
  | RadioField
  | CheckboxField
  | ComboboxField
  | CustomField<TItem>;
