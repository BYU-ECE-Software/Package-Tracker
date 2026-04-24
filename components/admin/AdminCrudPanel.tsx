"use client";

import { useEffect, useState, useRef } from 'react';
import type { ConfigPanel, FieldConfig } from '@/types/configPanel';
import type { ToastProps } from '@/types/toast';
import Toast from '@/components/general/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button, { Spinner } from '@/components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props<T extends { id: string }, CreatePayload> {
  title: string;
  config: ConfigPanel<T, CreatePayload>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminCrudPanel<
  T extends { id: string },
  CreatePayload,
>({ title, config }: Props<T, CreatePayload>) {
  const [items, setItems] = useState<T[]>([]);
  const [formData, setFormData] = useState<Partial<CreatePayload>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose' | 'duration'> | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await config.api.getAll();
        setItems(data);
      } catch (err) {
        console.error('Error loading items:', err);
        setToast({
          type: 'error',
          title: 'Error',
          message: `Failed to load ${config.noun}s. Please try again later.`,
        });
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [config]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleInputChange = (
    field: keyof CreatePayload,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await config.api.update(editingId, formData as Partial<T>);
        setToast({ type: 'success', title: 'Success', message: `${config.noun} updated` });
      } else {
        await config.api.create(formData as CreatePayload);
        setToast({ type: 'success', title: 'Success', message: `${config.noun} created` });
      }
      setFormData({});
      setEditingId(null);
      const updated = await config.api.getAll();
      setItems(updated);
    } catch (err) {
      console.error('Error saving:', err);
      setToast({
        type: 'error',
        title: 'Error',
        message: `Failed to ${editingId ? 'update' : 'create'} ${config.noun}`,
      });
    }
  };

  const handleEdit = (item: T) => {
    const editable: Partial<CreatePayload> = {};
    for (const key in config.fields) {
      // TODO: tighten this type once ConfigPanel generics are revisited
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editable[key as keyof CreatePayload] = item[key as keyof T] as any;
    }
    setFormData(editable);
    setEditingId(item.id);
    setTimeout(() => firstInputRef.current?.focus(), 0);
  };

  const handleCancelEdit = () => {
    setFormData({});
    setEditingId(null);
  };

  const openDelete = (item: T) => {
    setPendingDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await config.api.remove(pendingDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== pendingDelete.id));
      setToast({ type: 'success', title: 'Success', message: `${config.noun} deleted` });
    } catch (err) {
      console.error('Error deleting:', err);
      setToast({ type: 'error', title: 'Error', message: `Failed to delete ${config.noun}` });
    } finally {
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 bg-white border rounded-lg shadow text-byu-navy">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-[45%] mb-6">
          {Object.entries(config.fields).map(([fieldName, fieldMetaRaw], index) => {
            const field = fieldName as keyof CreatePayload;
            const meta = fieldMetaRaw as FieldConfig;
            const value = formData[field] ?? (meta.type === 'checkbox' ? false : '');

            return (
              <div key={fieldName}>
                <label className="block text-sm font-medium text-byu-navy">
                  {meta.label}
                  {meta.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>

                {meta.type === 'radio' ? (
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={String(field)}
                        value="true"
                        checked={value === true}
                        onChange={() => handleInputChange(field, true)}
                        required={meta.required}
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={String(field)}
                        value="false"
                        checked={value === false}
                        onChange={() => handleInputChange(field, false)}
                      />
                      No
                    </label>
                  </div>
                ) : meta.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => handleInputChange(field, e.target.checked)}
                    className="mt-1"
                  />
                ) : (
                  <input
                    ref={index === 0 ? firstInputRef : undefined}
                    type={meta.type}
                    value={value as string | number}
                    onChange={(e) =>
                      handleInputChange(
                        field,
                        meta.type === 'number' ? Number(e.target.value) : e.target.value
                      )
                    }
                    required={meta.required}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-byu-royal focus:border-transparent"
                  />
                )}
              </div>
            );
          })}

          <div className="flex gap-3">
            <Button type="submit">
              {editingId ? 'Save' : 'Add'}
            </Button>
            {editingId && (
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="w-full lg:w-[55%] overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Spinner className="h-8 w-8 text-byu-navy" />
              <p className="text-sm text-gray-500">Loading…</p>
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No {config.noun}s found. Add one to get started!
            </p>
          ) : (
            <table className="table-auto w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  {Object.entries(config.fields).map(([fieldName, fieldMetaRaw]) => {
                    const meta = fieldMetaRaw as FieldConfig;
                    return (
                      <th
                        key={fieldName}
                        className="px-4 py-2 border whitespace-nowrap text-left"
                      >
                        {meta.label}
                      </th>
                    );
                  })}
                  <th className="px-4 py-2 border whitespace-nowrap text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const allowEdit = config.canEdit?.(item) ?? true;
                  const allowDelete = config.canDelete?.(item) ?? true;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {Object.keys(config.fields).map((fieldName) => (
                        <td
                          key={fieldName}
                          className="px-4 py-2 border whitespace-nowrap"
                        >
                          {String(item[fieldName as keyof T] ?? '')}
                        </td>
                      ))}
                      <td className="px-4 py-2 border whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          {allowEdit && (
                            <Button size="sm" onClick={() => handleEdit(item)}>
                              Edit
                            </Button>
                          )}
                          {allowDelete && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => openDelete(item)}
                            >
                              Delete
                            </Button>
                          )}
                          {!allowEdit && !allowDelete && (
                            <span className="text-xs text-gray-400">
                              Unable to edit
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={`Delete ${config.noun}?`}
        message={`This will permanently remove the selected ${config.noun}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}