// Admin config for the Professor entity.
// Mirrors lib/admin/usersConfig.tsx.

import type { DataTableColumn } from '@/components/general/data-display/DataTable';
import type { FormModalField } from '@/components/general/forms/FormModal';
import type { AdminCrudConfig } from '@/components/general/admin/AdminCrudPanel';
import type { Professor, CreateProfessorRequest } from '@/types/professor';
import {
  fetchProfessors,
  createProfessor,
  updateProfessor,
  deleteProfessor,
} from '@/lib/api/professors';

const fetchAll = () => fetchProfessors({ pageSize: 1000 }).then((r) => r.data);

const columns: DataTableColumn<Professor>[] = [
  { key: 'lastName', header: 'Last Name', noWrap: true },
  { key: 'firstName', header: 'First Name', noWrap: true },
  { key: 'title', header: 'Title' },
  { key: 'email', header: 'Email' },
];

const fields: FormModalField[] = [
  { key: 'firstName', label: 'First name', required: true },
  { key: 'lastName', label: 'Last name', required: true },
  { key: 'title', label: 'Title' },
  { key: 'email', label: 'Email', type: 'email' },
];

const initialValues: CreateProfessorRequest = {
  firstName: '',
  lastName: '',
  title: '',
  email: '',
};

export function buildProfessorsConfig(): AdminCrudConfig<
  Professor,
  CreateProfessorRequest
> {
  return {
    noun: 'Professor',
    columns,
    fields,
    initialValues,
    toFormValues: (p) => ({
      firstName: p.firstName,
      lastName: p.lastName,
      title: p.title ?? '',
      email: p.email ?? '',
    }),
    api: {
      getAll: fetchAll,
      create: createProfessor,
      update: updateProfessor,
      remove: deleteProfessor,
    },
  };
}
