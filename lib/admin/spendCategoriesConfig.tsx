// Admin config for the SpendCategory entity.
// Mirrors lib/admin/usersConfig.tsx.

import type { DataTableColumn } from '@/components/general/data-display/DataTable';
import type { FormModalField } from '@/components/general/forms/FormModal';
import type { AdminCrudConfig } from '@/components/general/admin/AdminCrudPanel';
import type {
  SpendCategory,
  CreateSpendCategoryRequest,
} from '@/types/spendCategory';
import {
  fetchSpendCategories,
  createSpendCategory,
  updateSpendCategory,
  deleteSpendCategory,
} from '@/lib/api/spendCategories';

const fetchAll = () =>
  fetchSpendCategories({ pageSize: 1000 }).then((r) => r.data);

const isOther = (code: string) => code.trim().toLowerCase() === 'other';

const columns: DataTableColumn<SpendCategory>[] = [
  { key: 'code', header: 'Code', noWrap: true },
  { key: 'description', header: 'Description' },
  {
    key: 'visibleToStudents',
    header: 'Student Visible',
    noWrap: true,
    render: (row) => (
      <span
        className={`rounded-full px-2 py-0.5 text-xs uppercase ${
          row.visibleToStudents
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {row.visibleToStudents ? 'Yes' : 'No'}
      </span>
    ),
  },
];

const fields: FormModalField[] = [
  { key: 'code', label: 'Code', required: true },
  { key: 'description', label: 'Description', required: true, colSpan: 2 },
  { kind: 'checkbox', key: 'visibleToStudents', label: 'Visible to students' },
];

const initialValues: CreateSpendCategoryRequest = {
  code: '',
  description: '',
  visibleToStudents: true,
};

export function buildSpendCategoriesConfig(): AdminCrudConfig<
  SpendCategory,
  CreateSpendCategoryRequest
> {
  return {
    noun: 'Spend Category',
    columns,
    fields,
    initialValues,
    toFormValues: (s) => ({
      code: s.code,
      description: s.description,
      visibleToStudents: s.visibleToStudents,
    }),
    api: {
      getAll: fetchAll,
      create: createSpendCategory,
      update: updateSpendCategory,
      remove: deleteSpendCategory,
    },
    canEdit: (s) => !isOther(s.code),
    canDelete: (s) => !isOther(s.code),
  };
}
