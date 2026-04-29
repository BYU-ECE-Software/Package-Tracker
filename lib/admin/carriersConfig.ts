// Admin config — drives <DropdownEditor /> for the Carrier entity.
// DropdownEditor takes a flat set of CRUD callbacks rather than a config
// object; this file just bundles the API wrappers so the page can spread
// them onto the editor in one line.

import type { DropdownEditorProps } from '@/components/ui/admin/DropdownEditor';
import {
  fetchCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  reorderCarriers,
} from '@/lib/api/carriers';

export const carriersEditorProps: DropdownEditorProps = {
  noun: 'Carrier',
  fetchItems: fetchCarriers,
  createItem: createCarrier,
  updateItem: updateCarrier,
  deleteItem: deleteCarrier,
  reorderItems: reorderCarriers,
};
