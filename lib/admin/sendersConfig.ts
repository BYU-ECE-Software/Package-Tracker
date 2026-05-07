// Admin config — drives <AdminDropdownPanel /> for the Sender entity.

import type { AdminDropdownConfig } from '@/components/general/admin/AdminDropdownPanel';
import {
  fetchSenders,
  createSender,
  updateSender,
  deleteSender,
  reorderSenders,
} from '@/lib/api/senders';

export const sendersConfig: AdminDropdownConfig = {
  noun: 'Sender',
  fetchItems: fetchSenders,
  createItem: createSender,
  updateItem: updateSender,
  deleteItem: deleteSender,
  reorderItems: reorderSenders,
};
