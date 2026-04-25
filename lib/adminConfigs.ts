import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from './api/users';

import {
  fetchCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  reorderCarriers,
} from './api/carriers';

import {
  fetchSenders,
  createSender,
  updateSender,
  deleteSender,
  reorderSenders,
} from './api/senders';

import type { ConfigPanel } from '@/components/ui/admin/AdminCrudPanel';
import type { DropdownEditorProps } from '@/components/ui/admin/DropdownEditor';
import type { User, CreateUserRequest } from '@/types/user';

export const adminConfigs = {

  // Students
  Students: {
    noun: 'Student',
    component: 'crud' as const,
    fields: {
      fullName: { label: 'Full Name', type: 'text', required: true },
      netId: { label: 'BYU Net ID', type: 'text', required: true },
      email: { label: 'Email', type: 'text', required: true },
    },
    api: {
      getAll: () => fetchUsers({ pageSize: 1000 }).then((r) => r.data),
      create: createUser,
      update: updateUser,
      remove: deleteUser,
    },
  } satisfies ConfigPanel<User, CreateUserRequest>,

  // Carriers
  Carriers: {
    noun: 'Carrier',
    component: 'dropdown' as const,
    dropdown: {
      noun: 'Carrier',
      fetchItems: fetchCarriers,
      createItem: createCarrier,
      updateItem: updateCarrier,
      deleteItem: deleteCarrier,
      reorderItems: reorderCarriers,
    } satisfies DropdownEditorProps,
  },

  // Senders
  Senders: {
    noun: 'Sender',
    component: 'dropdown' as const,
    dropdown: {
      noun: 'Sender',
      fetchItems: fetchSenders,
      createItem: createSender,
      updateItem: updateSender,
      deleteItem: deleteSender,
      reorderItems: reorderSenders,
    } satisfies DropdownEditorProps,
  },
};