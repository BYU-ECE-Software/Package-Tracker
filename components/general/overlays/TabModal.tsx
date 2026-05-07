// Tabbed modal (parent owns activeTab — controlled component).
// Composes BaseModal: shares overlay, header, close button, escape key,
// scroll lock, and footer styling. The tab bar lives in BaseModal's topBar
// slot; the optional footer prop passes straight through.
'use client';

import type { ReactNode } from 'react';
import BaseModal from '@/components/general/overlays/BaseModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalSize = 'sm' | 'md' | 'lg';

export type TabConfig = {
  key: string;
  label: string;
  content: ReactNode;
};

type TabModalProps = {
  open: boolean;
  title?: string;
  size?: ModalSize;
  onClose: () => void;

  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (key: string) => void;

  footer?: ReactNode; // custom footer if needed
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TabModal({
  open,
  title,
  size = 'md',
  onClose,
  tabs,
  activeTab,
  onTabChange,
  footer,
}: TabModalProps) {
  const activeTabContent = tabs.find((t) => t.key === activeTab)?.content;

  const topBar = (
    <div className="flex border-b border-gray-200 bg-white px-5 pt-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`mr-4 pb-2 text-sm font-medium transition border-b-2 ${
            activeTab === tab.key
              ? 'border-byu-navy text-byu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <BaseModal
      open={open}
      title={title}
      size={size}
      onClose={onClose}
      topBar={topBar}
      footer={footer}
    >
      {activeTabContent}
    </BaseModal>
  );
}
