// PT admin page — three tabs:
//   - Users     (AdminCrudPanel, full CRUD with role select)
//   - Carriers  (AdminDropdownPanel — drag-reorder + soft-hide)
//   - Vendors   (AdminDropdownPanel — drag-reorder + soft-hide)
//
// Configs live in lib/admin/<entity>Config{,.tsx}. The Admin page is a
// thin shell — to add a new tab, drop a new config file and add it to
// the TABS list + the conditional render below.
'use client';

import { useMemo, useState } from 'react';
import PageTitle from '@/components/general/layout/PageTitle';
import AdminTabs from '@/components/general/admin/AdminTabs';
import AdminCrudPanel from '@/components/general/admin/AdminCrudPanel';
import AdminDropdownPanel from '@/components/general/admin/AdminDropdownPanel';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import { buildUsersConfig } from '@/lib/admin/usersConfig';
import { carriersConfig } from '@/lib/admin/carriersConfig';
import { vendorsConfig } from '@/lib/admin/vendorsConfig';

type Tab = 'Users' | 'Carriers' | 'Vendors';
const TABS: Tab[] = ['Users', 'Carriers', 'Vendors'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Users');
  const { user } = useAuth();

  // Memoize the Users config so AdminCrudPanel's effect doesn't refire on every
  // render; closes over the current user's id so canDelete can hide self-deletion.
  const usersConfig = useMemo(
    () => buildUsersConfig(user?.id ?? null),
    [user?.id],
  );

  return (
    <>
      <PageTitle title="SITE ADMIN" />
      <div className="px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6 lg:flex-row">
          <AdminTabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="flex-1">
            {activeTab === 'Users' && (
              <AdminCrudPanel title="Users" config={usersConfig} />
            )}
            {activeTab === 'Carriers' && (
              <AdminDropdownPanel key="Carriers" title="Carriers" config={carriersConfig} />
            )}
            {activeTab === 'Vendors' && (
              <AdminDropdownPanel key="Vendors" title="Vendors" config={vendorsConfig} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
