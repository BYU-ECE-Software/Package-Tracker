'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import type { DropdownEntity } from '@/types/dropdown';
import Toast, { type ToastProps } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/modals/ConfirmModal';
import Button from '@/components/ui/Button';
import {
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ────────────────────────────────────────────────────────────────────

type EditingState = { id: string; name: string } | null;

/**
 * Reusable admin interface for managing ordered dropdown lists (carriers, senders, categories, etc.).
 * 
 * ## Features
 * - Drag-and-drop reordering
 * - Inline editing with keyboard shortcuts (Enter to save, Escape to cancel)
 * - Active/inactive toggle (eye icon)
 * - Delete with confirmation modal
 * - Toast notifications for all actions
 * 
 * ## Setup Requirements
 * 
 * ### 1. Database Schema
 * Your entity must have these fields:
 * ```prisma
 * model YourEntity {
 *   id       String  @id @default(cuid())
 *   name     String
 *   isActive Boolean @default(true)
 *   order    Int     @default(0)
 * }
 * ```
 * 
 * ### 2. API Functions
 * Implement these in `lib/api/yourEntities.ts`:
 * ```typescript
 * import type { DropdownEntity } from '@/types/dropdown';
 * 
 * export async function fetchYourEntities(): Promise<DropdownEntity[]>
 * export async function createYourEntity(data: { name: string }): Promise<DropdownEntity>
 * export async function updateYourEntity(id: string, data: { name?: string; isActive?: boolean }): Promise<DropdownEntity>
 * export async function deleteYourEntity(id: string): Promise<void>
 * export async function reorderYourEntities(orderedIds: string[]): Promise<void>
 * ```
 * 
 * ### 3. API Routes
 * Create these endpoints:
 * - `GET /api/your-entities` - fetch all
 * - `POST /api/your-entities` - create
 * - `PATCH /api/your-entities/[id]` - update
 * - `DELETE /api/your-entities/[id]` - delete
 * - `POST /api/your-entities/reorder` - reorder
 * 
 * ### 4. Admin Config
 * Add to `lib/adminConfigs.ts`:
 * ```typescript
 * YourEntities: {
 *   noun: 'Your Entity',
 *   component: 'dropdown' as const,
 *   dropdown: {
 *     noun: 'Your Entity',
 *     fetchItems: fetchYourEntities,
 *     createItem: createYourEntity,
 *     updateItem: updateYourEntity,
 *     deleteItem: deleteYourEntity,
 *     reorderItems: reorderYourEntities,
 *   }
 * }
 * ```
 * 
 * @example
 * ```tsx
 * <DropdownEditor
 *   noun="Carrier"
 *   fetchItems={fetchCarriers}
 *   createItem={createCarrier}
 *   updateItem={updateCarrier}
 *   deleteItem={deleteCarrier}
 *   reorderItems={reorderCarriers}
 * />
 * ```
 */
export interface DropdownEditorProps {
  /** Human-readable singular noun (e.g., "Carrier", "Sender") used in UI messages */
  noun: string;
  
  /** Fetch all items (active and inactive) */
  fetchItems: () => Promise<DropdownEntity[]>;
  
  /** Create a new item with just a name */
  createItem: (data: { name: string }) => Promise<DropdownEntity>;
  
  /** Update an item's name and/or active status */
  updateItem: (id: string, data: { name?: string; isActive?: boolean }) => Promise<DropdownEntity>;
  
  /** Permanently delete an item */
  deleteItem: (id: string) => Promise<void>;
  
  /** Persist new order after drag-and-drop */
  reorderItems: (orderedIds: string[]) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DropdownEditor({
  noun,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
}: DropdownEditorProps) {
  const [items, setItems] = useState<DropdownEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<EditingState>(null);
  const [confirmDelete, setConfirmDelete] = useState<DropdownEntity | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // useCallback keeps `load` stable across renders so it can be safely listed
  // as a useEffect dependency without causing an infinite loop
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
    } catch {
      setToast({ type: 'error', title: 'Error', message: `Failed to load ${noun}s.` });
    } finally {
      setLoading(false);
    }
  }, [fetchItems, noun]);

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
      setToast({ type: 'error', title: 'Missing Name', message: `Please enter a name for the ${noun}.` });
      return;
    }
    try {
      await createItem({ name: newName.trim() });
      setNewName('');
      await load();
      setToast({ type: 'success', title: 'Added', message: `${noun} added successfully.` });
    } catch {
      setToast({ type: 'error', title: 'Error', message: `Failed to add ${noun}.` });
    }
  };

  const handleToggleActive = async (item: DropdownEntity) => {
    try {
      await updateItem(item.id, { isActive: !item.isActive });
      await load();
    } catch {
      setToast({ type: 'error', title: 'Error', message: `Failed to update ${noun}.` });
    }
  };

  const handleEditSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      setToast({ type: 'error', title: 'Missing Name', message: 'Name cannot be empty.' });
      return;
    }
    try {
      await updateItem(editing.id, { name: editing.name.trim() });
      setEditing(null);
      await load();
      setToast({ type: 'success', title: 'Updated', message: `${noun} updated successfully.` });
    } catch {
      setToast({ type: 'error', title: 'Error', message: `Failed to update ${noun}.` });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    // Optimistic update: reorder locally first, then persist
    // If the API call fails, roll back to the previous order
    const previous = items;
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    try {
      await reorderItems(reordered.map((i) => i.id));
    } catch {
      setItems(previous);
      setToast({ type: 'error', title: 'Error', message: `Failed to reorder ${noun}s.` });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteItem(confirmDelete.id);
      setConfirmDelete(null);
      await load();
      setToast({ type: 'success', title: 'Deleted', message: `${noun} deleted successfully.` });
    } catch (err: unknown) {
      // 409 means this item is still referenced by existing packages
      const message = err instanceof Error ? err.message : `Failed to delete ${noun}.`;
      setConfirmDelete(null);
      setToast({ type: 'error', title: 'Cannot Delete', message });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 bg-white border rounded-lg shadow text-byu-navy">
      <h2 className="text-xl font-semibold mb-4">{noun}s</h2>

      {/* Add new item */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={`New ${noun} name…`}
          className={inputClass}
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>

      {/* List */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No {noun}s yet. Add one above!
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  editing={editing}
                  editInputRef={editInputRef}
                  onSetEditing={setEditing}
                  onEditSave={handleEditSave}
                  onToggleActive={handleToggleActive}
                  onDeleteRequest={setConfirmDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title={`Delete ${noun}?`}
        message={`This will permanently remove "${confirmDelete?.name}".`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
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

// ─── SortableRow ──────────────────────────────────────────────────────────────

interface SortableRowProps {
  item: DropdownEntity;
  editing: EditingState;
  editInputRef: RefObject<HTMLInputElement | null>;
  onSetEditing: (state: EditingState) => void;
  onEditSave: () => void;
  onToggleActive: (item: DropdownEntity) => void;
  onDeleteRequest: (item: DropdownEntity) => void;
}

function SortableRow({
  item,
  editing,
  editInputRef,
  onSetEditing,
  onEditSave,
  onToggleActive,
  onDeleteRequest,
}: SortableRowProps) {
  const isEditing = editing?.id === item.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isEditing,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'flex items-center gap-3 px-4 py-3',
        item.isActive ? 'bg-white' : 'bg-gray-50',
        isDragging ? 'shadow-lg' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Drag handle — disabled while a row is being edited */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        aria-label="Drag to reorder"
        disabled={isEditing}
        className={`touch-none text-gray-300 hover:text-gray-500 ${
          isEditing ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* Name — switches between display and inline edit */}
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={editInputRef}
              type="text"
              value={editing.name}
              onChange={(e) =>
                onSetEditing({ id: item.id, name: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEditSave();
                if (e.key === 'Escape') onSetEditing(null);
              }}
              className="flex-1 rounded border border-byu-royal px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byu-royal"
            />
            <Button size="sm" onClick={onEditSave}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => onSetEditing(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <span
            className={`text-sm ${
              item.isActive ? 'text-byu-navy' : 'text-gray-400 line-through'
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
            onClick={() => onToggleActive(item)}
            title={item.isActive ? 'Hide from dropdown' : 'Show in dropdown'}
            className="text-gray-400 hover:text-byu-navy transition-colors"
          >
            {item.isActive
              ? <EyeIcon className="h-5 w-5" />
              : <EyeSlashIcon className="h-5 w-5" />
            }
          </button>

          <button
            type="button"
            onClick={() => onSetEditing({ id: item.id, name: item.name })}
            title="Edit name"
            className="text-gray-400 hover:text-byu-royal transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteRequest(item)}
            title="Delete"
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Shared within file ───────────────────────────────────────────────────────

const inputClass =
  'flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-byu-navy focus:outline-none focus:ring-2 focus:ring-byu-royal focus:border-transparent';