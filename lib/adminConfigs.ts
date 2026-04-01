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

/**
 * Central configuration for generating CRUD panels for different models.
 * Each key represents a tab title and includes:
 * - Noun for descriptor to display on toast
 * - Field definitions (for form rendering)
 * - API functions (for backend interaction)
 */
export const adminConfigs = {

  // Students
  Students: {
    noun: 'Student',
    component: 'crud',
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
    component: 'dropdown',
    fields: {
      name:     { label: 'Name',   type: 'text',     required: true  },
      isActive: { label: 'Active', type: 'checkbox', required: false },
    },
    api: {
      getAll: fetchCarriers,
      create: createCarrier,
      update: updateCarrier,
      // Soft-hide only — set isActive to false instead of deleting
      remove: (id: string) => updateCarrier(id, { isActive: false }).then(() => {}),
    },
  } satisfies ConfigPanel<Carrier, CreateCarrierRequest>,

  // Senders
  Senders: {
    noun: 'Sender',
    component: 'dropdown',
    fields: {
      name:     { label: 'Name',   type: 'text',     required: true  },
      isActive: { label: 'Active', type: 'checkbox', required: false },
    },
    api: {
      getAll: fetchSenders,
      create: createSender,
      update: updateSender,
      // Soft-hide only — set isActive to false instead of deleting
      remove: (id: string) => updateSender(id, { isActive: false }).then(() => {}),
    },
  } satisfies ConfigPanel<Sender, CreateSenderRequest>,
};
