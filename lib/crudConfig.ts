import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  CreateUserRequest,
  // UpdateUserRequest,
} from './api/users';

import {
  fetchCarriers,
  createCarrier,
  updateCarrier,
} from './api/carriers';

import {
  fetchSenders,
  createSender,
  updateSender,
} from './api/senders';

import type { CrudConfig } from '../types/crud';
import type { User } from '../types/user';
import type { Carrier, CreateCarrierRequest } from '../types/carrier';
import type { Sender, CreateSenderRequest } from '../types/sender';

/**
 * Central configuration for generating CRUD panels for different models.
 * Each key represents a tab title and includes:
 * - Noun for descriptor to display on toast
 * - Field definitions (for form rendering)
 * - API functions (for backend interaction)
 */
export const crudConfigs = {

  // Students
  Students: {
    noun: 'Student',
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
  } satisfies CrudConfig<User, CreateUserRequest>,

  // Carriers
  Carriers: {
    noun: 'Carrier',
    fields: {
      name:     { label: 'Name',   type: 'text',     required: true  },
      isActive: { label: 'Active', type: 'checkbox', required: false },
    },
    api: {
      getAll: fetchCarriers,
      create: createCarrier,
      update: updateCarrier,
      // Soft-hide only — set isActive to false instead of deleting
      remove: (id) => updateCarrier(id, { isActive: false }).then(() => {}),
    },
  } satisfies CrudConfig<Carrier, CreateCarrierRequest>,

  // Senders
  Senders: {
    noun: 'Sender',
    fields: {
      name:     { label: 'Name',   type: 'text',     required: true  },
      isActive: { label: 'Active', type: 'checkbox', required: false },
    },
    api: {
      getAll: fetchSenders,
      create: createSender,
      update: updateSender,
      // Soft-hide only — set isActive to false instead of deleting
      remove: (id) => updateSender(id, { isActive: false }).then(() => {}),
    },
  } satisfies CrudConfig<Sender, CreateSenderRequest>,
};
