// Admin config — drives <AdminDropdownPanel /> for the Carrier entity.

import type { AdminDropdownConfig } from '@/components/general/admin/AdminDropdownPanel';
import {
  fetchCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  reorderCarriers,
} from '@/lib/api/carriers';

export const carriersConfig: AdminDropdownConfig = {
  noun: 'Carrier',
  fetchItems: fetchCarriers,
  createItem: createCarrier,
  updateItem: updateCarrier,
  deleteItem: deleteCarrier,
  reorderItems: reorderCarriers,
};
