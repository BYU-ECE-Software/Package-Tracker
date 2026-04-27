'use client';

import { useState } from 'react';
import PageTitle from '@/components/layout/pageTitle';
import AdminTabs from '@/components/ui/admin/AdminTabs';
import AdminCrudPanel from '@/components/ui/admin/AdminCrudPanel';
import DropdownEditor from '@/components/ui/admin/DropdownEditor';
import { adminConfigs } from '@/lib/adminConfigs';

const tabNames = Object.keys(adminConfigs) as (keyof typeof adminConfigs)[];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabNames)[number]>(
    tabNames[0]
  );

  const config = adminConfigs[activeTab];

  return (
    <>
      <PageTitle title="SITE ADMIN" />
      <div className="px-6 py-10">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-4 sm:gap-6">
          <AdminTabs
            tabs={tabNames}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div className="flex-1">
            {config.component === 'dropdown' ? (
              <DropdownEditor key={activeTab} {...config.dropdown} />
            ) : (
              <AdminCrudPanel title={activeTab} config={config} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}