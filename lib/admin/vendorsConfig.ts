// Admin config — drives <AdminDropdownPanel /> for the Vendor entity.

import type { AdminDropdownConfig } from '@/components/general/admin/AdminDropdownPanel';
import {
  fetchVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  reorderVendors,
} from '@/lib/api/vendors';

export const vendorsConfig: AdminDropdownConfig = {
  noun: 'Vendor',
  fetchItems: fetchVendors,
  createItem: createVendor,
  updateItem: updateVendor,
  deleteItem: deleteVendor,
  reorderItems: reorderVendors,
};
