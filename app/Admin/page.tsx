'use client';

import { useState } from 'react';
import HeaderBar from '@/components/header';
import FooterBar from '@/components/footer';
import PageTitle from '@/components/pageTitle';
import AdminTabs from '@/components/SiteAdminTabs';
import AdminCrudPanel from '@/components/AdminCrudPanel';
import { crudConfigs } from '@/lib/crudConfig';
import Toast from '@/components/Toast';
import type { ToastProps } from '@/types/toast';

// Get all the keys (tab names) from the crudConfigs object
const tabNames = Object.keys(crudConfigs) as (keyof typeof crudConfigs)[];

export default function AdminPage() {
  // Set up state to track which tab is currently selected
  const [activeTab, setActiveTab] = useState<(typeof tabNames)[number]>(
    tabNames[0]
  );

  // Set up state to show a toast message (or nothing if null)
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose' | 'duration'> | null>(null);

  return (
    <>
      <HeaderBar />
      <PageTitle title="SITE ADMIN" />

      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-out">
          <Toast 
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)} 
          />
        </div>
      )}
      <div className="flex flex-col lg:flex-row px-4 sm:px-6 py-6 sm:py-10 gap-4 sm:gap-6">
        <AdminTabs
          tabs={tabNames}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="flex-1">
          <AdminCrudPanel
            title={activeTab}
            config={crudConfigs[activeTab] as any}
            setToast={setToast}
          />
        </div>
      </div>
      <FooterBar />
    </>
  );
}