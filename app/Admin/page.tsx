'use client';

import { useState } from 'react';
import PageTitle from '@/components/layout/pageTitle';
import AdminTabs from '@/components/admin/SiteAdminTabs';
import AdminCrudPanel from '@/components/admin/AdminCrudPanel';
import DropdownEditor from '@/components/admin/DropdownEditor';
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
      <div className="flex flex-col lg:flex-row px-4 sm:px-6 py-6 sm:py-10 gap-4 sm:gap-6">
        <AdminTabs
          tabs={tabNames}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="flex-1">
          {config.component === 'dropdown' ? (
            <DropdownEditor key={activeTab} {...config.dropdown} />
          ) : (
            // TODO: AdminCrudPanel's config type doesn't fully align with all
            // tab configs — revisit when AdminCrudPanel is refactored
            <AdminCrudPanel title={activeTab} config={config as never} />
          )}
        </div>
      </div>
    </>
  );
}