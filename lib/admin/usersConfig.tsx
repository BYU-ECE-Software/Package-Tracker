// Example admin config — drives <AdminCrudPanel /> for the User entity.
//
// What it demonstrates:
//   - `columns`: how to pick which fields show up in the DataTable, with
//     custom render functions for derived display (e.g., role badges).
//   - `fields`: how to build a FormModal from FormFieldDef entries — a
//     mix of plain text inputs and a select.
//   - `initialValues`: the empty starting payload for the Add form. Note
//     how a checkbox would be `false`, and a combobox would be
//     `{ id: '', name: '' }`.
//   - `toFormValues`: project a fetched row onto the form's value shape
//     when the user clicks Edit. Drop fields the form doesn't expose.
//   - `canDelete`: gate the Delete action per row. Used here to prevent
//     users from deleting themselves.
//
// To adapt for your entity:
//   1. Swap `User` / `CreateUserRequest` for your model + payload.
//   2. Update columns/fields to match the fields you want exposed.
//   3. Wire `api.*` to your lib/api/<entity>.ts wrappers.

import type { DataTableColumn } from '@/components/ui/tables/DataTable';
import type { FormModalField } from '@/components/ui/modals/FormModal';
import type { ConfigPanel } from '@/components/ui/admin/AdminCrudPanel';
import type { User, CreateUserRequest } from '@/types/user';
import { Role } from '@prisma/client';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '@/lib/api/users';

// PT's lib/api/users.ts is paginated — pull a large page and unwrap.
const fetchAllUsers = () => fetchUsers({ pageSize: 1000 }).then((r) => r.data);

const columns: DataTableColumn[] = [
  { key: 'fullName', header: 'Name', noWrap: true },
  { key: 'netId', header: 'Net ID', noWrap: true },
  { key: 'email', header: 'Email' },
  {
    key: 'role',
    header: 'Role',
    noWrap: true,
    render: (row: User) => (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs uppercase text-gray-700">
        {row.role}
      </span>
    ),
  },
];

const fields: FormModalField[] = [
  { key: 'fullName', label: 'Full name', required: true },
  { key: 'netId', label: 'Net ID', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  {
    kind: 'select',
    key: 'role',
    label: 'Role',
    required: true,
    options: [
      { label: 'Student', value: Role.STUDENT },
      { label: 'Secretary', value: Role.SECRETARY },
      { label: 'Admin', value: Role.ADMIN },
    ],
  },
];

const initialValues: CreateUserRequest = {
  fullName: '',
  netId: '',
  email: '',
  role: Role.STUDENT,
};

export function buildUsersConfig(currentUserId: string | null): ConfigPanel<User, CreateUserRequest> {
  return {
    noun: 'User',
    columns,
    fields,
    initialValues,
    toFormValues: (u) => ({
      fullName: u.fullName,
      netId: u.netId,
      email: u.email,
      role: u.role,
    }),
    api: {
      getAll: fetchAllUsers,
      create: createUser,
      update: updateUser,
      remove: deleteUser,
    },
    canDelete: (u) => u.id !== currentUserId, // can't delete yourself
  };
}
