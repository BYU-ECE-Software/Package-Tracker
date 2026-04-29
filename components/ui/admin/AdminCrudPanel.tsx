// NOT IN Template-Repo — application-level pattern, not a generic primitive.
// Belongs in this project, not the template. Built on top of template
// primitives (DataTable, FormModal, ConfirmModal, RowActionMenu, Button,
// useToast) and encodes app-specific CRUD assumptions.
//
// What it does for you:
//   - Header with a title and a primary "Add {noun}" button
//   - DataTable rendering of items (with whatever columns you configure)
//   - "More" menu per row containing Edit, Delete, and any extra actions
//     you pass in `rowActions`
//   - FormModal for create + edit, driven by FormFieldDef[] (so you get
//     SelectField / Combobox / CheckboxField / etc. for free)
//   - ConfirmModal for delete, with toasts on success/failure
//
// To adapt for your entity:
//   1. Define a `ConfigPanel<T, CreatePayload>` (see Users example in
//      app/Admin/page.tsx for a full walkthrough).
//   2. Pass it to <AdminCrudPanel title="..." config={config} />.
'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/actions/Button';
import Spinner from '@/components/ui/forms/Spinner';
import ConfirmModal from '@/components/ui/modals/ConfirmModal';
import FormModal, { type FormModalField } from '@/components/ui/modals/FormModal';
import DataTable, {
  type DataTableAction,
  type DataTableColumn,
} from '@/components/ui/tables/DataTable';
import { useToast } from '@/hooks/useToast';

export interface ConfigPanel<T extends { id: string }, CreatePayload extends Record<string, any> = Partial<T>> {
  /** Singular noun for UI copy ("User", "Tag"). */
  noun: string;

  /** Columns shown in the list table. Edit/Delete/extra actions are appended automatically. */
  columns: DataTableColumn[];

  /** Form fields for both create and edit. Drives FormModal. */
  fields: FormModalField[];

  /** Default values for the create form. Combobox fields should default to `{ id: '', name: '' }`. */
  initialValues: CreatePayload;

  /** Project a row onto the form-values shape when the user clicks Edit. */
  toFormValues: (item: T) => CreatePayload;

  api: {
    getAll: () => Promise<T[]>;
    create: (data: CreatePayload) => Promise<T>;
    update: (id: string, data: Partial<CreatePayload>) => Promise<T>;
    remove: (id: string) => Promise<void>;
  };

  /** Hide the Edit menu item per row (returns false to hide). */
  canEdit?: (item: T) => boolean;
  /** Hide the Delete menu item per row (returns false to hide). */
  canDelete?: (item: T) => boolean;
}

interface Props<T extends { id: string }, CreatePayload extends Record<string, any>> {
  title: string;
  config: ConfigPanel<T, CreatePayload>;
  /** Extra row actions appended to the per-row menu (after Edit, before Delete). */
  rowActions?: DataTableAction[];
}

export default function AdminCrudPanel<
  T extends { id: string },
  CreatePayload extends Record<string, any>,
>({ title, config, rowActions = [] }: Props<T, CreatePayload>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CreatePayload>(config.initialValues);
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    // Reload only when the underlying config object changes (parent swap).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const openCreate = () => {
    setEditingId(null);
    setFormValues(config.initialValues);
    setFormOpen(true);
  };

  const openEdit = (item: T) => {
    setEditingId(item.id);
    setFormValues(config.toFormValues(item));
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await config.api.update(editingId, formValues);
        showToast({
          type: 'success',
          title: 'Saved',
          message: `${config.noun} updated.`,
        });
      } else {
        await config.api.create(formValues);
        showToast({
          type: 'success',
          title: 'Added',
          message: `${config.noun} created.`,
        });
      }
      setFormOpen(false);
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
      showToast({
        type: 'success',
        title: 'Deleted',
        message: `${config.noun} deleted.`,
      });
      setPendingDelete(null);
      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to delete ${config.noun}.`;
      showToast({ type: 'error', title: 'Cannot delete', message });
    } finally {
      setDeleting(false);
    }
  };

  // Append the actions column. DataTable shows the column header but renders
  // a "more" menu in each cell, so the header label can stay empty.
  const columnsWithActions: DataTableColumn[] = [
    ...config.columns,
    {
      key: '__actions',
      header: '',
      headerClassName: 'w-12',
      cellClassName: 'w-12',
      actions: [
        {
          label: 'Edit',
          onClick: (row: T) => openEdit(row),
          hidden: (row: T) => config.canEdit?.(row) === false,
        },
        ...rowActions,
        {
          label: 'Delete',
          variant: 'danger',
          onClick: (row: T) => setPendingDelete(row),
          hidden: (row: T) => config.canDelete?.(row) === false,
        },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-byu-navy text-xl font-semibold">{title}</h2>
        <Button onClick={openCreate}>Add {config.noun}</Button>
      </div>

      {loading && !items.length ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner className="text-byu-navy h-8 w-8" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      ) : (
        <DataTable
          data={items}
          columns={columnsWithActions}
          emptyMessage={`No ${config.noun}s yet. Add one to get started.`}
        />
      )}

      <FormModal
        open={formOpen}
        title={editingId ? `Edit ${config.noun}` : `Add ${config.noun}`}
        size="md"
        saving={saving}
        saveLabel={editingId ? 'Save' : 'Add'}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        values={formValues as Record<string, any>}
        setValues={(next) => setFormValues(next as CreatePayload)}
        fields={config.fields}
      />

      <ConfirmModal
        open={!!pendingDelete}
        title={`Delete ${config.noun}?`}
        message={`This will permanently remove the selected ${config.noun}.`}
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
