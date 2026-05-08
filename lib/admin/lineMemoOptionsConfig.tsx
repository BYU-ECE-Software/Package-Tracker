// Admin config for the LineMemoOption entity.
//
// TODO: LineMemoOption.id is Int but AdminCrudConfig requires id: string.
// Adapter wraps id as string for the panel and unwraps at the API. Side
// effect: the id field shows in the edit modal but is silently ignored.
// Possible fixes: (1) extend FormModalField with editableOn: 'create' | 'always',
// (2) make line memos a Vendor-style dropdown entity, or (3) keep the
// numeric label as a separate @unique field with a real cuid id.

import type { DataTableColumn } from '@/components/general/data-display/DataTable';
import type { FormModalField } from '@/components/general/forms/FormModal';
import type { AdminCrudConfig } from '@/components/general/admin/AdminCrudPanel';
import type {
  LineMemoOption,
  CreateLineMemoOptionRequest,
  UpdateLineMemoOptionRequest,
} from '@/types/lineMemoOption';
import {
  fetchLineMemoOptions,
  createLineMemoOption,
  updateLineMemoOption,
  deleteLineMemoOption,
} from '@/lib/api/lineMemoOptions';

// Stringified-id row, used only by the admin panel.
type LineMemoOptionRow = Omit<LineMemoOption, 'id'> & { id: string };

// Form-values shape: `id` is a string here so the FormModal's text/number
// input can edit it on create. We convert to number before calling the API.
type LineMemoOptionForm = {
  id: string;
  description: string;
};

const fetchAll = async (): Promise<LineMemoOptionRow[]> => {
  const res = await fetchLineMemoOptions({ pageSize: 1000 });
  return res.data.map((r) => ({ ...r, id: String(r.id) }));
};

const create = async (data: LineMemoOptionForm): Promise<LineMemoOptionRow> => {
  const payload: CreateLineMemoOptionRequest = {
    id: Number(data.id),
    description: data.description,
  };
  const created = await createLineMemoOption(payload);
  return { ...created, id: String(created.id) };
};

const update = async (
  id: string,
  data: Partial<LineMemoOptionForm>,
): Promise<LineMemoOptionRow> => {
  const payload: UpdateLineMemoOptionRequest = {};
  if (data.description !== undefined) payload.description = data.description;
  // id is intentionally not updateable.
  const updated = await updateLineMemoOption(Number(id), payload);
  return { ...updated, id: String(updated.id) };
};

const remove = (id: string) => deleteLineMemoOption(Number(id));

const columns: DataTableColumn<LineMemoOptionRow>[] = [
  { key: 'id', header: 'Code', noWrap: true },
  { key: 'description', header: 'Description' },
];

// `id` is editable on create only; the panel doesn't natively support
// per-mode field gating, so we surface it as a regular field. The backend
// rejects PUT requests that try to change it (we just don't send id on
// update — see `update` above).
const fields: FormModalField[] = [
  {
    key: 'id',
    label: 'Workday memo code',
    required: true,
    type: 'number',
    helperText: 'Integer code from Workday. Cannot be changed after creation.',
  },
  { key: 'description', label: 'Description', required: true, colSpan: 2 },
];

const initialValues: LineMemoOptionForm = {
  id: '',
  description: '',
};

export function buildLineMemoOptionsConfig(): AdminCrudConfig<
  LineMemoOptionRow,
  LineMemoOptionForm
> {
  return {
    noun: 'Line Memo Option',
    columns,
    fields,
    initialValues,
    toFormValues: (r) => ({
      id: r.id,
      description: r.description,
    }),
    api: {
      getAll: fetchAll,
      create,
      update,
      remove,
    },
  };
}
