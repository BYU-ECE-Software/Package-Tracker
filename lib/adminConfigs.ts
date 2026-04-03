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
} from './api/carriers';

import {
  fetchSenders,
  createSender,
  updateSender,
  deleteSender,
} from './api/senders';

import type { ConfigPanel } from '../types/configPanel';
import type { User, CreateUserRequest } from '../types/user';
import type { Carrier, CreateCarrierRequest } from '../types/carrier';
import type { Sender, CreateSenderRequest } from '../types/sender';

export interface DropdownConfig {
  noun: string;
  fetchItems: () => Promise<any[]>;
  createItem: (data: { name: string }) => Promise<any>;
  updateItem: (id: string, data: { name?: string; isActive?: boolean }) => Promise<any>;
  deleteItem: (id: string) => Promise<void>;
}

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
    fields: {
      name:     { label: 'Name',   type: 'text',     required: true  },
      isActive: { label: 'Active', type: 'checkbox', required: false },
    },
    api: {
      getAll: fetchCarriers,
      create: createCarrier,
      update: updateCarrier,
      remove: (id: string) => updateCarrier(id, { isActive: false }).then(() => {}),
    },
    dropdown: {
      noun: 'Carrier',
      fetchItems: fetchCarriers,
      createItem: (data: { name: string }) => createCarrier(data),
      updateItem: (id: string, data: { name?: string; isActive?: boolean }) => updateCarrier(id, data),
      deleteItem: deleteCarrier,
    } satisfies DropdownConfig,
  },

  // Senders
  Senders: {
    noun: 'Sender',
    component: 'dropdown' as const,
    fields: {
      name:     { label: 'Name',   type: 'text',     required: true  },
      isActive: { label: 'Active', type: 'checkbox', required: false },
    },
    api: {
      getAll: fetchSenders,
      create: createSender,
      update: updateSender,
      remove: (id: string) => updateSender(id, { isActive: false }).then(() => {}),
    },
    dropdown: {
      noun: 'Sender',
      fetchItems: fetchSenders,
      createItem: (data: { name: string }) => createSender(data),
      updateItem: (id: string, data: { name?: string; isActive?: boolean }) => updateSender(id, data),
      deleteItem: deleteSender,
    } satisfies DropdownConfig,
  },
};