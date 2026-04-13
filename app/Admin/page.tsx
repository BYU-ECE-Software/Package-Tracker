'use client';

import { useState } from 'react';
import PageTitle from '@/components/layout/pageTitle';
import AdminTabs from '@/components/admin/SiteAdminTabs';
import AdminCrudPanel from '@/components/admin/AdminCrudPanel';
import DropdownEditor from '@/components/admin/DropdownEditor';
import { adminConfigs } from '@/lib/adminConfigs';

// Get all the keys (tab names) from the adminConfigs object
const tabNames = Object.keys(adminConfigs) as (keyof typeof adminConfigs)[];

export default function AdminPage() {
  // Set up state to track which tab is currently selected
  const [activeTab, setActiveTab] = useState<(typeof tabNames)[number]>(
    tabNames[0]
  );

  return (
    <>
      <PageTitle title="SITE ADMIN" />
      <div className="flex flex-col lg:flex-row px-4 sm:px-6 py-6 sm:py-10 gap-4 sm:gap-6">
        <AdminTabs
          tabs={tabNames}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="flex-1">
          {adminConfigs[activeTab].component === 'dropdown'
            ? <DropdownEditor key={activeTab} {...adminConfigs[activeTab].dropdown} />
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : <AdminCrudPanel title={activeTab} config={adminConfigs[activeTab] as any} />
          }
        </div>
      </div>
    </>
  );
}