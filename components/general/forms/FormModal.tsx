'use client';

import { useState } from 'react';
import BaseModal from '@/components/general/overlays/BaseModal';
import FilePicker from '@/components/general/forms/FilePicker';
import FieldWrapper from '@/components/general/forms/FieldWrapper';
import SelectField from '@/components/general/forms/SelectField';
import RadioGroupField from '@/components/general/forms/RadioGroupField';
import TextLikeField from '@/components/general/forms/TextLikeField';
import PinField from '@/components/general/forms/PinField';
import CheckboxField from '@/components/general/forms/CheckboxField';
import Combobox from '@/components/general/forms/Combobox';
import type {
  CheckboxField as CheckboxFieldType,
  ComboboxField as ComboboxFieldType,
  CustomField,
  InputField,
  RadioField,
  SelectField as SelectFieldType,
} from '@/components/general/forms/formFieldTypes';

// Modal sizing options passed straight through to BaseModal
type ModalSize = 'sm' | 'md' | 'lg';

export type FormModalField =
  | InputField
  | SelectFieldType
  | RadioField
  | CheckboxFieldType
  | ComboboxFieldType
  | CustomField;

// Props for the FormModal component
type FormModalProps<T extends Record<string, unknown>> = {
  open: boolean;
  title: string;
  size?: ModalSize;
  saving?: boolean;
  saveLabel?: string;
  submitDisabled?: boolean;
  onClose: () => void;
  onSubmit?: () => void;

  values: T;
  setValues: (next: T) => void;

  fields: FormModalField[];

  errors?: Partial<Record<keyof T, string>>; // key matches the field key, value is the error message
};

export default function FormModal<T extends Record<string, unknown>>({
  open,
  title,
  size = 'lg',
  saving = false,
  saveLabel = 'Save',
  submitDisabled = false,
  onClose,
  onSubmit,
  values,
  setValues,
  fields,
  errors,
}: FormModalProps<T>) {
  const setFieldValue = (key: string, value: unknown) => {
    setValues({ ...values, [key]: value } as T);
  };

  // Whether to show or hide a pin
  const [pinVisible, setPinVisible] = useState<Record<string, boolean>>({});
  const isPinVisible = (key: string) => Boolean(pinVisible[key]);
  const togglePinVisible = (key: string) => setPinVisible((p) => ({ ...p, [key]: !p[key] }));

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      size={size}
      saving={saving}
      saveLabel={saveLabel}
      submitDisabled={submitDisabled}
    >
      {/* Fields are laid out in a 2-column grid, matching FullPageForm's layout */}
      <div className="grid auto-rows-[auto_auto_auto] grid-cols-1 gap-x-4 md:grid-cols-2">
        {fields.map((field) => {
          const colSpan = field.colSpan ?? 1;
          const colClass = colSpan === 2 ? 'md:col-span-2' : '';

          if ('kind' in field && field.kind === 'custom') {
            return (
              <div key={field.key} className={colClass}>
                {field.render()}
              </div>
            );
          }

          // Each `kind` branch below casts the value to the shape its input expects.
          // FormModal is generic over arbitrary value shapes, so this layer trusts
          // the consumer to put the right type under each field key.
          const rawValue = values[field.key];
          const errorText = errors?.[field.key as keyof T];

          // Renders the correct input component based on the field's kind and type
          return (
            <FieldWrapper
              key={field.key}
              className={colClass}
              label={field.label}
              required={field.required}
              helperText={field.helperText}
              error={errorText}
            >
              {field.kind === 'select' ? (
                <SelectField
                  value={(rawValue as string) ?? ''}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  options={field.options}
                  placeholder={field.placeholder}
                />
              ) : field.kind === 'radio' ? (
                <RadioGroupField
                  name={field.key}
                  value={rawValue as string | number | boolean}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  options={field.options}
                />
              ) : field.kind === 'checkbox' ? (
                <CheckboxField
                  checked={Boolean(rawValue)}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                />
              ) : field.kind === 'combobox' ? (
                <Combobox
                  items={field.items}
                  value={
                    rawValue && typeof rawValue === 'object' && 'id' in rawValue && 'name' in rawValue
                      ? (rawValue as { id: string; name: string })
                      : { id: '', name: '' }
                  }
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'textarea' ? (
                <TextLikeField
                  as="textarea"
                  rows={3}
                  value={(rawValue as string | number) ?? ''}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  placeholder={field.placeholder}
                  adornment={field.adornment}
                  includeTextColor={false}
                />
              ) : field.type === 'pin' ? (
                <PinField
                  value={(rawValue as string) ?? ''}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  visible={isPinVisible(field.key)}
                  onToggleVisible={() => togglePinVisible(field.key)}
                  placeholder={field.placeholder}
                  showTitle
                />
              ) : field.type === 'file' ? (
                <FilePicker
                  value={rawValue as File | null}
                  accept={field.accept}
                  onChange={(file) => setFieldValue(field.key, file)}
                />
              ) : (
                <TextLikeField
                  as="input"
                  type={field.type ?? 'text'}
                  value={(rawValue as string | number) ?? ''}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  placeholder={field.placeholder}
                  adornment={field.adornment}
                  inputMode={(field.type ?? 'text') === 'number' ? 'decimal' : undefined}
                  includeTextColor={false}
                />
              )}
            </FieldWrapper>
          );
        })}
      </div>
    </BaseModal>
  );
}
