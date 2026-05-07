// Generic CRUD panel for flat entities. Composes the template primitives:
//   - DataTable for the list, with a per-row "more" menu (Edit + extras + Delete)
//   - FormModal for create + edit, driven by FormModalField[] (so you get
//     SelectField / Combobox / CheckboxField / etc. for free)
//   - ConfirmModal for delete, with toasts on success/failure
//
// To adapt for an entity:
//   1. Build a AdminCrudConfig<T, CreatePayload> with columns / fields /
//      initialValues / toFormValues / api callbacks (and optional canEdit /
//      canDelete predicates).
//   2. Mount: <AdminCrudPanel title="…" config={config} rowActions={…} />
'use client';

import { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Button from '@/components/general/actions/Button';
import Spinner from '@/components/general/feedback/Spinner';
import ConfirmModal from '@/components/general/overlays/ConfirmModal';
import FormModal, { type FormModalField } from '@/components/general/forms/FormModal';
import DataTable, {
  type DataTableAction,
  type DataTableColumn,
} from '@/components/general/data-display/DataTable';
import { useToast } from '@/hooks/useToast';

export interface AdminCrudConfig<
  T extends { id: string },
  CreatePayload extends object = Partial<T>,
> {
  /** Singular noun for UI copy ("User", "Tag"). */
  noun: string;

  /** Columns shown in the list table. Edit/Delete/extra actions are appended automatically. */
  columns: DataTableColumn<T>[];

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

interface Props<T extends { id: string }, CreatePayload extends object> {
  title: string;
  config: AdminCrudConfig<T, CreatePayload>;
  /** Extra row actions appended to the per-row menu (after Edit, before Delete). */
  rowActions?: DataTableAction<T>[];
}

export default function AdminCrudPanel<
  T extends { id: string },
  CreatePayload extends object,
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

  // Reload only when the underlying config object changes (parent swap).
  // The setLoading inside reload is the right pattern for fetch-on-key.
   
  useEffect(() => {
    reload();
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
        showToast({ type: 'success', title: 'Saved', message: `${config.noun} updated.` });
      } else {
        await config.api.create(formValues);
        showToast({ type: 'success', title: 'Added', message: `${config.noun} created.` });
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
      showToast({ type: 'success', title: 'Deleted', message: `${config.noun} deleted.` });
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
  const columnsWithActions: DataTableColumn<T>[] = [
    ...config.columns,
    {
      key: '__actions',
      header: '',
      headerClassName: 'w-12',
      cellClassName: 'w-12',
      actions: [
        {
          label: 'Edit',
          icon: <FiEdit2 className="h-4 w-4" />,
          onClick: (row) => openEdit(row),
          hidden: (row) => config.canEdit?.(row) === false,
        },
        ...rowActions,
        {
          label: 'Delete',
          icon: <FiTrash2 className="h-4 w-4" />,
          variant: 'danger',
          onClick: (row) => setPendingDelete(row),
          hidden: (row) => config.canDelete?.(row) === false,
        },
      ],
    },
  ];

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
        values={formValues as unknown as Record<string, unknown>}
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
