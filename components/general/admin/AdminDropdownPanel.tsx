// Drag-and-drop ordered list editor for entities that look like editable
// dropdown sources (categories, tags, carriers). Composes SortableList for
// the dnd-kit machinery, layered with the admin-specific affordances most
// call sites want:
//   - Inline-edit a row's name (Enter to save, Escape to cancel)
//   - Soft-hide via a `hidden` flag (eye icon toggle)
//   - Optimistic-with-rollback reorder
//   - 409-on-in-use delete (caller's deleteItem can throw with a useful
//     message; the modal surfaces it)
//
// Requirements:
//   - Entity must conform to DropdownEntity ({ id, name, hidden, order }).
//   - Caller supplies CRUD callbacks: fetchItems, createItem, updateItem,
//     deleteItem, reorderItems.
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { DropdownEntity } from '@/types/general/DropdownEntity';
import ConfirmModal from '@/components/general/overlays/ConfirmModal';
import Button from '@/components/general/actions/Button';
import SortableList, { DragHandle } from '@/components/general/actions/SortableList';
import { INPUT_CLASS } from '@/components/general/forms/formFieldStyles';
import { useToast } from '@/hooks/useToast';
import { FiEye, FiEyeOff, FiEdit2, FiTrash2 } from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

type EditingState = { id: string; name: string } | null;

export interface AdminDropdownConfig {
  /** Human-readable singular noun (e.g., "Carrier", "Vendor") used in UI messages */
  noun: string;

  /** Fetch all items (active and inactive) */
  fetchItems: () => Promise<DropdownEntity[]>;

  /** Create a new item with just a name */
  createItem: (data: { name: string }) => Promise<DropdownEntity>;

  /** Update an item's name and/or active status */
  updateItem: (id: string, data: { name?: string; hidden?: boolean }) => Promise<DropdownEntity>;

  /** Permanently delete an item */
  deleteItem: (id: string) => Promise<void>;

  /** Persist new order after drag-and-drop */
  reorderItems: (orderedIds: string[]) => Promise<void>;
}

interface Props {
  title: string;
  config: AdminDropdownConfig;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDropdownPanel({ title, config }: Props) {
  const { noun, fetchItems, createItem, updateItem, deleteItem, reorderItems } = config;
  const [items, setItems] = useState<DropdownEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDelete, setConfirmDelete] = useState<DropdownEntity | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { showToast, ToastContainer } = useToast({ position: 'bottom-right' });

  // useCallback keeps `load` stable across renders so it can be safely listed
  // as a useEffect dependency without causing an infinite loop
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: `Failed to load ${noun}s.` });
    } finally {
      setLoading(false);
    }
    // showToast identity is stable from useToast; safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchItems, noun]);

  // setLoading inside load() is the right pattern for fetch-on-mount.
   
  useEffect(() => {
    load();
  }, [load]);
   

  // Focus the inline edit input as soon as editing starts
  useEffect(() => {
    if (editing) setTimeout(() => editInputRef.current?.focus(), 0);
  }, [editing]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!newName.trim()) {
      showToast({ type: 'error', title: 'Missing Name', message: `Please enter a name for the ${noun}.` });
      return;
    }
    try {
      await createItem({ name: newName.trim() });
      setNewName('');
      await load();
      showToast({ type: 'success', title: 'Added', message: `${noun} added successfully.` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: `Failed to add ${noun}.` });
    }
  };

  const handleToggleActive = async (item: DropdownEntity) => {
    try {
      await updateItem(item.id, { hidden: !item.hidden });
      await load();
    } catch {
      showToast({ type: 'error', title: 'Error', message: `Failed to update ${noun}.` });
    }
  };

  const handleEditSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      showToast({ type: 'error', title: 'Missing Name', message: 'Name cannot be empty.' });
      return;
    }
    try {
      await updateItem(editing.id, { name: editing.name.trim() });
      setEditing(null);
      await load();
      showToast({ type: 'success', title: 'Updated', message: `${noun} updated successfully.` });
    } catch {
      showToast({ type: 'error', title: 'Error', message: `Failed to update ${noun}.` });
    }
  };

  // Optimistic update: SortableList hands us the new order; persist it and
  // roll back if the API call fails.
  const handleReorder = async (next: DropdownEntity[]) => {
    const previous = items;
    setItems(next);
    try {
      await reorderItems(next.map((i) => i.id));
    } catch {
      setItems(previous);
      showToast({ type: 'error', title: 'Error', message: `Failed to reorder ${noun}s.` });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteItem(confirmDelete.id);
      setConfirmDelete(null);
      await load();
      showToast({ type: 'success', title: 'Deleted', message: `${noun} deleted successfully.` });
    } catch (err: unknown) {
      // 409 means this item is still referenced by existing records
      const message = err instanceof Error ? err.message : `Failed to delete ${noun}.`;
      setConfirmDelete(null);
      showToast({ type: 'error', title: 'Cannot Delete', message });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="text-byu-navy">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {/* Add new item */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={`New ${noun} name…`}
          className={INPUT_CLASS}
        />
        <Button onClick={handleAdd} label="Add" />
      </div>

      {/* List */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No {noun}s yet. Add one above!
        </p>
      ) : (
        <SortableList<DropdownEntity>
          items={items}
          onReorder={handleReorder}
          lockAxis
          // Override SortableList's default flex-col-gap-2 with a divided
          // bordered container so the rows read as a single list.
          className="flex flex-col divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          renderItem={(item, dragHandleProps) => {
            const isEditing = editing?.id === item.id;

            return (
              <div
                className={`flex items-center gap-3 px-4 py-3 ${
                  !item.hidden ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {/* Drag handle — disabled while editing so the row can't be
                    grabbed accidentally. SortableList only listens on the
                    element receiving dragHandleProps. */}
                <DragHandle disabled={isEditing} {...(isEditing ? {} : dragHandleProps)} />

                {/* Name — switches between display and inline edit */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ id: item.id, name: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') setEditing(null);
                        }}
                        className="flex-1 rounded border border-byu-royal px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byu-royal"
                      />
                      <Button size="sm" onClick={handleEditSave} label="Save" />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditing(null)}
                        label="Cancel"
                      />
                    </div>
                  ) : (
                    <span
                      className={`text-sm ${
                        !item.hidden ? 'text-byu-navy' : 'text-gray-400 line-through'
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </div>

                {/* Action icons — hidden while editing */}
                {!isEditing && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      title={!item.hidden ? 'Hide from dropdown' : 'Show in dropdown'}
                      className="text-gray-400 hover:text-byu-navy transition-colors"
                    >
                      {!item.hidden ? (
                        <FiEye className="h-5 w-5" />
                      ) : (
                        <FiEyeOff className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditing({ id: item.id, name: item.name })}
                      title="Edit name"
                      className="text-gray-400 hover:text-byu-royal transition-colors"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDelete(item)}
                      title="Delete"
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            );
          }}
        />
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title={`Delete ${noun}?`}
        message={`This will permanently remove "${confirmDelete?.name}".`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      <ToastContainer />
    </div>
  );
}
