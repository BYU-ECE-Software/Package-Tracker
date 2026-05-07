// Admin config — drives <AdminDropdownPanel /> for the Carrier entity.
// AdminDropdownPanel takes a flat set of CRUD callbacks rather than a config
// object; this file just bundles the API wrappers so the page can spread
// them onto the editor in one line.

import type { AdminDropdownPanelProps } from '@/components/general/admin/AdminDropdownPanel';
import {
  fetchCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  reorderCarriers,
} from '@/lib/api/carriers';

export const carriersEditorProps: AdminDropdownPanelProps = {
  noun: 'Carrier',
  fetchItems: fetchCarriers,
  createItem: createCarrier,
  updateItem: updateCarrier,
  deleteItem: deleteCarrier,
  reorderItems: reorderCarriers,
};
