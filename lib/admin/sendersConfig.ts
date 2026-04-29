// Admin config — drives <DropdownEditor /> for the Sender entity.

import type { DropdownEditorProps } from '@/components/ui/admin/DropdownEditor';
import {
  fetchSenders,
  createSender,
  updateSender,
  deleteSender,
  reorderSenders,
} from '@/lib/api/senders';

export const sendersEditorProps: DropdownEditorProps = {
  noun: 'Sender',
  fetchItems: fetchSenders,
  createItem: createSender,
  updateItem: updateSender,
  deleteItem: deleteSender,
  reorderItems: reorderSenders,
};
