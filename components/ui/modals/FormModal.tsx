// MODIFIED from Template-Repo: components/general/forms/FormModal.tsx
// Worth upstreaming alongside the formFieldTypes change. Local addition:
//   - 'checkbox' field kind dispatch — renders the new CheckboxField for
//     boolean form fields (paired with components/ui/forms/CheckboxField.tsx
//     and the CheckboxField type added to formFieldTypes).
// Import paths (BaseModal, FilePicker, FieldWrapper, SelectField,
// RadioGroupField, TextLikeField, PinField, CheckboxField, formFieldTypes)
// also rewritten to match this project's components/ui/ structure.
'use client';

import { useState, type ReactNode } from 'react';
import BaseModal from '@/components/ui/modals/BaseModal';
import FilePicker from '@/components/ui/forms/FilePicker';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import FormGrid from '@/components/ui/forms/FormGrid';
import SelectField from '@/components/ui/forms/SelectField';
import RadioGroupField from '@/components/ui/forms/RadioGroupField';
import TextLikeField from '@/components/ui/forms/TextLikeField';
import PinField from '@/components/ui/forms/PinField';
import CheckboxField from '@/components/ui/forms/CheckboxField';
import type {
  CheckboxField as CheckboxFieldType,
  CustomField,
  InputField,
  RadioField,
  SelectField as SelectFieldType,
} from '@/components/ui/forms/formFieldTypes';

// Modal sizing options passed straight through to BaseModal
type ModalSize = 'sm' | 'md' | 'lg';

export type FormModalField =
  | InputField
  | SelectFieldType
  | RadioField
  | CheckboxFieldType
  | CustomField;

// Props for the FormModal component
type FormModalProps<T extends Record<string, any>> = {
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

export default function FormModal<T extends Record<string, any>>({
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
  const setFieldValue = (key: string, value: any) => {
    setValues({ ...values, [key]: value });
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
      <FormGrid>
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

          const value = values[field.key] ?? '';
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
                  value={value}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  options={field.options}
                  placeholder={field.placeholder}
                />
              ) : field.kind === 'radio' ? (
                <RadioGroupField
                  name={field.key}
                  value={value}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  options={field.options}
                />
              ) : field.kind === 'checkbox' ? (
                <CheckboxField
                  checked={Boolean(value)}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                />
              ) : field.type === 'textarea' ? (
                <TextLikeField
                  as="textarea"
                  rows={3}
                  value={value}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  placeholder={field.placeholder}
                  adornment={field.adornment}
                  includeTextColor={false}
                />
              ) : field.type === 'pin' ? (
                <PinField
                  value={value}
                  onChange={(nextValue) => setFieldValue(field.key, nextValue)}
                  visible={isPinVisible(field.key)}
                  onToggleVisible={() => togglePinVisible(field.key)}
                  placeholder={field.placeholder}
                  showTitle
                />
              ) : field.type === 'file' ? (
                <FilePicker
                  value={value}
                  accept={field.accept}
                  onChange={(file) => setFieldValue(field.key, file)}
                />
              ) : (
                <TextLikeField
                  as="input"
                  type={field.type ?? 'text'}
                  value={value}
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
      </FormGrid>
    </BaseModal>
  );
}
