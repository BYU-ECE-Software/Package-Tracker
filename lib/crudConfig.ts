import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  CreateUserRequest,
  // UpdateUserRequest,
} from './clientApi';

import type { CrudConfig } from '../types/crud';
import type { User } from '../types/user';
import { Update } from 'next/dist/build/swc/types';

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
      getAll: fetchUsers,
      create: createUser,
      update: updateUser,
      remove: deleteUser,
    },
  } satisfies CrudConfig<User, CreateUserRequest>,
};
