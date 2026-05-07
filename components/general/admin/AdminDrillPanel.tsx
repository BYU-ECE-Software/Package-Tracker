// Master/detail admin pattern: list view → drill into a row to edit it
// alongside an app-supplied child editor that owns its own state.
//
// AdminDrillPanel is the layout/control-flow primitive that FormModal can't
// be: FormModal is a single flat form, but AdminDrillPanel can host a child
// component (`drill`) with its own state (e.g. seats inside a Room, students
// inside a Class). The child registers a save function the parent invokes on
// "Save Changes", so the inline-form fields and the child's data PATCH/POST
// in one atomic request — no partial-failure window from two requests.
//
// To wire a new entity:
//   1. Define DrillConfig<T, CreatePayload> with columns, fields, initialValues,
//      toFormValues, and the api callbacks.
//   2. Build a child component matching the `drill` prop's signature — it
//      receives item / mode / formValues and the registerSave/setBlocked/
//      setDirty callbacks to coordinate with the parent's Save button.
//   3. Mount: <AdminDrillPanel title="…" config={config} drill={ChildEditor} />
'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Button from '@/components/general/actions/Button';
import Spinner from '@/components/general/feedback/Spinner';
import ConfirmModal from '@/components/general/overlays/ConfirmModal';
import DataTable, { type DataTableColumn } from '@/components/general/data-display/DataTable';
import FieldWrapper from '@/components/general/forms/FieldWrapper';
import FormGrid from '@/components/general/forms/FormGrid';
import TextLikeField from '@/components/general/forms/TextLikeField';
import SelectField from '@/components/general/forms/SelectField';
import RadioGroupField from '@/components/general/forms/RadioGroupField';
import CheckboxField from '@/components/general/forms/CheckboxField';
import Combobox from '@/components/general/forms/Combobox';
import PinField from '@/components/general/forms/PinField';
import FilePicker from '@/components/general/forms/FilePicker';
import type { FormModalField } from '@/components/general/forms/FormModal';
import { useToast } from '@/hooks/useToast';

export interface DrillConfig<
  T extends { id: string },
  CreatePayload extends Record<string, unknown> = Partial<T>,
> {
  /** Singular noun for UI copy ("Class", "Room"). */
  noun: string;

  /** Columns shown in the list table. Drill arrow is appended automatically. */
  columns: DataTableColumn<T>[];

  /** Fields for the inline edit section. Same shape FormModal consumes, so
   *  input/select/radio/checkbox/combobox/custom kinds all work. */
  fields: FormModalField[];

  /** Default values for creating new items (used by the Add button). */
  initialValues: CreatePayload;

  /** Project a row onto the form-values shape for inline editing. */
  toFormValues: (item: T) => CreatePayload;

  api: {
    getAll: () => Promise<T[]>;
    create: (data: CreatePayload) => Promise<T>;
    update: (id: string, data: Partial<CreatePayload>) => Promise<T>;
    remove: (id: string) => Promise<void>;
  };
}

interface Props<T extends { id: string }, CreatePayload extends Record<string, unknown>> {
  title: string;
  config: DrillConfig<T, CreatePayload>;
  /** Custom config panel rendered below the inline-form fields in the drill view. */
  drill: React.ComponentType<{
    /** The row being edited, or `null` while creating a new one. */
    item: T | null;
    /** Distinguishes a fresh "Add" view from an existing-item edit. */
    mode: 'create' | 'edit';
    /** Current inline-form snapshot — gives the child access to the name etc. */
    formValues: CreatePayload;
    onUpdate: () => void;
    /**
     * Child registers a save function the parent will invoke on Save Changes.
     * In create mode the function should POST and return the new item; the
     * parent uses that return value to flip into edit mode on the new row.
     * Pass null to clear (e.g. when the child has nothing to save).
     */
    registerSave: (fn: (() => Promise<T | void>) | null) => void;
    /** Child reports whether saving should be blocked (validation errors). */
    setBlocked: (blocked: boolean) => void;
    /** Child reports whether it has unsaved changes vs. the persisted state. */
    setDirty: (dirty: boolean) => void;
  }>;
}

type Mode = 'list' | 'create' | 'edit';

export default function AdminDrillPanel<
  T extends { id: string },
  CreatePayload extends Record<string, unknown>,
>({
  title,
  config,
  drill: DrillComponent,
}: Props<T, CreatePayload>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('list');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [editValues, setEditValues] = useState<CreatePayload>(config.initialValues);
  // Snapshot of the inline form at drill-in / last save. `editValues` is dirty
  // when any field key in `config.fields` differs from this snapshot.
  const [formSnapshot, setFormSnapshot] = useState<CreatePayload>(config.initialValues);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [childBlocked, setChildBlocked] = useState(false);
  const [childDirty, setChildDirty] = useState(false);

  const formDirty = config.fields.some((f) => {
    if ('kind' in f && f.kind === 'custom') return false;
    return (editValues as Record<string, unknown>)[f.key] !== (formSnapshot as Record<string, unknown>)[f.key];
  });
  const dirty = formDirty || childDirty;

  // Holds the child config panel's pending-save function, if any.
  const childSaveRef = useRef<(() => Promise<T | void>) | null>(null);
  const registerChildSave = (fn: (() => Promise<T | void>) | null) => {
    childSaveRef.current = fn;
  };

  const { showToast, ToastContainer } = useToast({ position: 'bottom-right' });

  const reload = async () => {
    try {
      setLoading(true);
      const data = await config.api.getAll();
      setItems(data);
    } catch {
      showToast({
        type: 'error',
        title: 'Error',
        message: `Failed to load ${config.noun}s.`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // reload depends only on config.api closure; re-run on config identity
    // change is intentional and sufficient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const setFieldValue = (key: string, value: unknown) => {
    setEditValues({ ...editValues, [key]: value } as CreatePayload);
  };

  const resetDrillState = () => {
    setSelectedItem(null);
    setEditValues(config.initialValues);
    setFormSnapshot(config.initialValues);
    setChildBlocked(false);
    setChildDirty(false);
    childSaveRef.current = null;
  };

  const handleDrillIn = (item: T) => {
    const snapshot = config.toFormValues(item);
    setMode('edit');
    setSelectedItem(item);
    setEditValues(snapshot);
    setFormSnapshot(snapshot);
    setChildBlocked(false);
    setChildDirty(false);
  };

  const openCreate = () => {
    setMode('create');
    resetDrillState();
  };

  const handleBack = () => {
    setMode('list');
    resetDrillState();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedItem: T | undefined;

      if (mode === 'edit' && selectedItem) {
        if (childSaveRef.current) {
          // Drill child has registered a save fn — delegate the entire
          // PATCH to it so name + child-owned fields land in one atomic
          // request. Avoids the partial-failure window of two PATCHes.
          const result = await childSaveRef.current();
          if (result) savedItem = result;
        } else {
          // No child handler — PATCH inline-form fields only. Filtering to
          // `config.fields` keys keeps `toFormValues` placeholders (e.g.
          // seats: []) from clobbering data the inline form doesn't edit.
          const patchPayload = Object.fromEntries(
            config.fields
              .filter((f) => !('kind' in f && f.kind === 'custom'))
              .map((f) => [f.key, (editValues as Record<string, unknown>)[f.key]]),
          ) as Partial<CreatePayload>;
          savedItem = await config.api.update(selectedItem.id, patchPayload);
        }
        showToast({ type: 'success', title: 'Saved', message: `${config.noun} updated.` });
      } else if (mode === 'create') {
        // Create flow: the drill child owns the POST so it can include its
        // own state (e.g. seats) in a single round-trip. Parent doesn't call
        // api.create here.
        const created = childSaveRef.current ? await childSaveRef.current() : undefined;
        if (created) {
          savedItem = created;
          showToast({ type: 'success', title: 'Added', message: `${config.noun} created.` });
        }
      }

      // After a successful save, pop back out to the list view. Reset all
      // drill-view state so a subsequent drill-in starts clean.
      if (savedItem) {
        setMode('list');
        resetDrillState();
      }

      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to save ${config.noun}.`;
      showToast({ type: 'error', title: 'Error', message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await config.api.remove(pendingDelete.id);
      showToast({ type: 'success', title: 'Deleted', message: `${config.noun} deleted.` });
      setPendingDelete(null);
      setMode('list');
      setSelectedItem(null);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to delete ${config.noun}.`;
      showToast({ type: 'error', title: 'Cannot delete', message });
    } finally {
      setDeleting(false);
    }
  };

  // Pin-visibility map for any 'pin' kind fields the inline form might use.
  const [pinVisible, setPinVisible] = useState<Record<string, boolean>>({});
  const togglePinVisible = (key: string) =>
    setPinVisible((p) => ({ ...p, [key]: !p[key] }));

  const columnsWithArrow: DataTableColumn<T>[] = [
    ...config.columns,
    {
      key: '__drill',
      header: '',
      headerClassName: 'w-12',
      cellClassName: 'w-12 text-right',
      render: () => (
        <ArrowRightIcon className="text-byu-royal h-5 w-5 inline-block" aria-hidden="true" />
      ),
    },
  ];

  // ── Drilled view (create or edit) ────────────────────────────────────────
  if (mode === 'create' || mode === 'edit') {
    const headerLabel = mode === 'create' ? `New ${config.noun}` : `Edit ${config.noun}`;
    return (
      <div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">{headerLabel}</h3>
          <FormGrid>
            {config.fields.map((field) => {
              const colSpan = field.colSpan ?? 1;
              const colClass = colSpan === 2 ? 'md:col-span-2' : '';

              if ('kind' in field && field.kind === 'custom') {
                return (
                  <div key={field.key} className={colClass}>
                    {field.render()}
                  </div>
                );
              }

              const value = (editValues as Record<string, unknown>)[field.key] ?? '';

              return (
                <FieldWrapper
                  key={field.key}
                  className={colClass}
                  label={field.label}
                  required={field.required}
                  helperText={field.helperText}
                >
                  {field.kind === 'select' ? (
                    <SelectField
                      value={value as string}
                      onChange={(next) => setFieldValue(field.key, next)}
                      options={field.options}
                      placeholder={field.placeholder}
                    />
                  ) : field.kind === 'radio' ? (
                    <RadioGroupField
                      name={field.key}
                      value={value as string | number | boolean}
                      onChange={(next) => setFieldValue(field.key, next)}
                      options={field.options}
                    />
                  ) : field.kind === 'checkbox' ? (
                    <CheckboxField
                      checked={Boolean(value)}
                      onChange={(next) => setFieldValue(field.key, next)}
                    />
                  ) : field.kind === 'combobox' ? (
                    <Combobox
                      items={field.items}
                      value={
                        value && typeof value === 'object' && 'id' in value && 'name' in value
                          ? (value as { id: string; name: string })
                          : { id: '', name: '' }
                      }
                      onChange={(next) => setFieldValue(field.key, next)}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'textarea' ? (
                    <TextLikeField
                      as="textarea"
                      rows={3}
                      value={value as string | number}
                      onChange={(next) => setFieldValue(field.key, next)}
                      placeholder={field.placeholder}
                      adornment={field.adornment}
                      includeTextColor={false}
                    />
                  ) : field.type === 'pin' ? (
                    <PinField
                      value={value as string}
                      onChange={(next) => setFieldValue(field.key, next)}
                      visible={Boolean(pinVisible[field.key])}
                      onToggleVisible={() => togglePinVisible(field.key)}
                      placeholder={field.placeholder}
                      showTitle
                    />
                  ) : field.type === 'file' ? (
                    <FilePicker
                      value={value as File | null}
                      accept={field.accept}
                      onChange={(file) => setFieldValue(field.key, file)}
                    />
                  ) : (
                    <TextLikeField
                      as="input"
                      type={field.type ?? 'text'}
                      value={value as string | number}
                      onChange={(next) => setFieldValue(field.key, next)}
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
        </div>

        <DrillComponent
          item={selectedItem}
          mode={mode}
          formValues={editValues}
          onUpdate={reload}
          registerSave={registerChildSave}
          setBlocked={setChildBlocked}
          setDirty={setChildDirty}
        />

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={handleBack} disabled={saving} label={`Back to ${config.noun}s`} />
          <div className="flex gap-3">
            {mode === 'edit' && selectedItem && (
              <Button
                variant="danger"
                onClick={() => setPendingDelete(selectedItem)}
                disabled={saving}
                label="Delete"
              />
            )}
            <Button
              onClick={handleSave}
              disabled={saving || childBlocked || !dirty}
              loading={saving}
              loadingLabel="Saving…"
              label="Save Changes"
            />
          </div>
        </div>

        <ConfirmModal
          open={!!pendingDelete}
          title={`Delete ${config.noun}?`}
          message={`This will permanently remove this ${config.noun} and all its configuration.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          busy={deleting}
          busyLabel="Deleting…"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />

        <ToastContainer />
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-byu-navy text-xl font-semibold">{title}</h2>
        <Button onClick={openCreate} label={`Add ${config.noun}`} />
      </div>

      {loading && !items.length ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner className="text-byu-navy h-8 w-8" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      ) : (
        <DataTable
          data={items}
          columns={columnsWithArrow}
          emptyMessage={`No ${config.noun}s yet.`}
          onRowClick={handleDrillIn}
        />
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`Delete ${config.noun}?`}
        message={`This will permanently remove this ${config.noun} and all its configuration.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        busy={deleting}
        busyLabel="Deleting…"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ToastContainer />
    </div>
  );
}
