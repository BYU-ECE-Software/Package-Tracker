'use client';

import { useEffect, useState, useRef } from 'react';
import type { ToastProps } from '@/types/toast';
import Toast from '@/components/shared/Toast';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
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

interface DropdownItem {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

interface DropdownEditorProps {
  noun: string;
  fetchItems: () => Promise<DropdownItem[]>;
  createItem: (data: { name: string }) => Promise<DropdownItem>;
  updateItem: (id: string, data: { name?: string; isActive?: boolean }) => Promise<DropdownItem>;
  deleteItem: (id: string) => Promise<void>;
  reorderItems: (orderedIds: string[]) => Promise<void>;
}

export default function DropdownEditor({
  noun,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
}: DropdownEditorProps) {
  const [items, setItems] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DropdownItem | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
    } catch {
      setToast({ type: 'error', title: 'Error', message: `Failed to load ${noun}s.` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId) {
      setTimeout(() => editInputRef.current?.focus(), 0);
    }
  }, [editingId]);

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

  const handleToggleActive = async (item: DropdownItem) => {
    try {
      await updateItem(item.id, { isActive: !item.isActive });
      await load();
    } catch {
      setToast({ type: 'error', title: 'Error', message: `Failed to update ${noun}.` });
    }
  };

  const handleEditStart = (item: DropdownItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleEditSave = async (id: string) => {
    if (!editingName.trim()) {
      setToast({ type: 'error', title: 'Missing Name', message: 'Name cannot be empty.' });
      return;
    }
    try {
      await updateItem(id, { name: editingName.trim() });
      setEditingId(null);
      await load();
      setToast({ type: 'success', title: 'Updated', message: `${noun} updated successfully.` });
    } catch {
      setToast({ type: 'error', title: 'Error', message: `Failed to update ${noun}.` });
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const prev = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    try {
      await reorderItems(next.map((i) => i.id));
    } catch {
      setItems(prev);
      setToast({ type: 'error', title: 'Error', message: `Failed to reorder ${noun}s.` });
      await load();
    }
  };

  const handleDeleteAttempt = async (item: DropdownItem) => {
    setConfirmDelete(item);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteItem(confirmDelete.id);
      setConfirmDelete(null);
      await load();
      setToast({ type: 'success', title: 'Deleted', message: `${noun} deleted successfully.` });
    } catch (err: unknown) {
      // Server returns 409 with message if packages depend on this item
      const message = err instanceof Error ? err.message : `Failed to delete ${noun}.`;
      setConfirmDelete(null);
      setToast({ type: 'error', title: 'Cannot Delete', message });
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow text-byu-navy">
      <h2 className="text-xl font-semibold text-byu-navy mb-4">{noun}s</h2>

      {/* Add new item */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={`New ${noun} name...`}
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-byu-royal focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          className="bg-byu-navy text-white px-4 py-2 rounded hover:bg-[#001F40] transition-colors text-sm"
        >
          Add
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-8 text-sm">
          No {noun}s yet. Add one above!
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-gray-200 border rounded">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  editingId={editingId}
                  editingName={editingName}
                  setEditingName={setEditingName}
                  editInputRef={editInputRef}
                  onToggleActive={handleToggleActive}
                  onEditStart={handleEditStart}
                  onEditSave={handleEditSave}
                  onEditCancel={handleEditCancel}
                  onDelete={handleDeleteAttempt}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        title={`Delete ${noun}?`}
        message={`This will permanently remove "${confirmDelete?.name}".`}
        confirmText="Delete"
        cancelText="Cancel"
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

interface SortableRowProps {
  item: DropdownItem;
  editingId: string | null;
  editingName: string;
  setEditingName: (v: string) => void;
  editInputRef: React.RefObject<HTMLInputElement | null>;
  onToggleActive: (item: DropdownItem) => void;
  onEditStart: (item: DropdownItem) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
  onDelete: (item: DropdownItem) => void;
}

function SortableRow({
  item,
  editingId,
  editingName,
  setEditingName,
  editInputRef,
  onToggleActive,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
}: SortableRowProps) {
  const isEditing = editingId === item.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
      className={`flex items-center gap-3 px-4 py-3 ${!item.isActive ? 'bg-gray-50' : 'bg-white'} ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        aria-label="Drag to reorder"
        disabled={isEditing}
        className={`touch-none text-gray-300 hover:text-gray-500 ${isEditing ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="7" cy="4" r="1.5" />
          <circle cx="13" cy="4" r="1.5" />
          <circle cx="7" cy="10" r="1.5" />
          <circle cx="13" cy="10" r="1.5" />
          <circle cx="7" cy="16" r="1.5" />
          <circle cx="13" cy="16" r="1.5" />
        </svg>
      </button>

      {/* Name — inline edit or display */}
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={editInputRef}
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEditSave(item.id);
                if (e.key === 'Escape') onEditCancel();
              }}
              className="border border-byu-royal rounded px-2 py-1 text-sm flex-1 focus:ring-2 focus:ring-byu-royal focus:border-transparent"
            />
            <button
              onClick={() => onEditSave(item.id)}
              className="text-xs text-white bg-byu-royal px-2 py-1 rounded hover:bg-[#003a9a]"
            >
              Save
            </button>
            <button
              onClick={onEditCancel}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className={`text-sm ${!item.isActive ? 'text-gray-400 line-through' : 'text-byu-navy'}`}>
            {item.name}
          </span>
        )}
      </div>

      {/* Action icons */}
      {!isEditing && (
        <div className="flex items-center gap-3">
          {/* Eye toggle */}
          <button
            onClick={() => onToggleActive(item)}
            title={item.isActive ? 'Hide from dropdown' : 'Show in dropdown'}
            className="text-gray-400 hover:text-byu-navy transition-colors"
          >
            {item.isActive ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            )}
          </button>

          {/* Pencil edit */}
          <button
            onClick={() => onEditStart(item)}
            title="Edit name"
            className="text-gray-400 hover:text-byu-royal transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Trash delete */}
          <button
            onClick={() => onDelete(item)}
            title="Delete"
            className="text-gray-400 hover:text-byu-red-bright transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}