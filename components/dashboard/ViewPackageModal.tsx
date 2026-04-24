'use client';

import { useState } from 'react';
import type React from 'react';
import type { Package } from '@/types/package';
import { formatDate } from '@/utils/formatDate';
import BaseModal from '@/components/ui/BaseModal';
import type { TabConfig } from '@/components/ui/BaseModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ViewPackageModalProps {
  onClose: () => void;
  pkg: Package | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(dateStr: Date | string | null | undefined): string | null {
  if (!dateStr) return null;
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ViewPackageModal({
  onClose,
  pkg,
}: ViewPackageModalProps) {
  const [activeTab, setActiveTab] = useState('details');

  if (!pkg) return null;

  const isCheckedOut = pkg.datePickedUp !== null || pkg.deliveredToOffice;
  const arrivedAgo = !isCheckedOut ? daysAgo(pkg.dateArrived) : null;

  const tabs: TabConfig[] = [
    {
      key: 'details',
      label: 'Details',
      content: (
        <DetailsTab pkg={pkg} isCheckedOut={isCheckedOut} arrivedAgo={arrivedAgo} />
      ),
    },
    {
      key: 'history',
      label: 'Tracking & History',
      content: <HistoryTab pkg={pkg} />,
    },
    {
      key: 'recipient',
      label: 'Recipient',
      content: <RecipientTab pkg={pkg} />,
    },
  ];

  return (
    <BaseModal
      open={true}
      title="Package Details"
      size="lg"
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      // View-only modal — no submit, just a Close button in the footer
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-byu-navy hover:bg-gray-50 transition cursor-pointer text-sm"
          >
            Close
          </button>
        </div>
      }
    />
  );
}

// ─── Tab: Details ─────────────────────────────────────────────────────────────

function DetailsTab({
  pkg,
  isCheckedOut,
  arrivedAgo,
}: {
  pkg: Package;
  isCheckedOut: boolean;
  arrivedAgo: string | null;
}) {
  return (
    <div className="space-y-1">
      {/* Status badge */}
      <div className="mb-3">
        <span
          className={`inline-block rounded px-2.5 py-0.5 text-xs font-medium ${
            isCheckedOut
              ? 'bg-byu-green-bright text-white'
              : 'bg-byu-yellow-bright text-byu-dark-gray'
          }`}
        >
          {isCheckedOut ? 'Checked Out' : 'Active'}
        </span>
      </div>

      <Row label="Recipient" value={`${pkg.recipient?.fullName ?? '—'} (${pkg.recipient?.netId ?? '—'})`} />
      <Row label="Carrier" value={pkg.carrier?.name ?? '—'} />
      <Row label="Sender" value={pkg.sender?.name ?? '—'} />
      <Row
        label="Date Arrived"
        value={
          <>
            {formatDate(pkg.dateArrived)}
            {arrivedAgo && (
              <span className="ml-2 text-xs text-gray-400">{arrivedAgo}</span>
            )}
          </>
        }
      />
      <Row label="Recipient Notified" value={pkg.notificationSent ? '✓ Yes' : '✗ No'} />

      {isCheckedOut && (
        <>
          <Row
            label="Checked Out"
            value={pkg.deliveredToOffice ? 'Delivered to Office' : formatDate(pkg.datePickedUp!)}
          />
          {pkg.checkedOutBy && (
            <Row label="Checked Out By" value={pkg.checkedOutBy.fullName} />
          )}
        </>
      )}

      {pkg.notes && (
        <div className="pt-1 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Internal Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{pkg.notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Tracking & History ──────────────────────────────────────────────────

function HistoryTab({ pkg }: { pkg: Package }) {
  return (
    <div className="space-y-1">
      <Row label="Date Arrived" value={formatDate(pkg.dateArrived)} />
      <Row label="Logged By" value={pkg.checkedInBy?.fullName ?? '—'} />
      <Row
        label="Date Picked Up"
        value={pkg.datePickedUp ? formatDate(pkg.datePickedUp) : '—'}
      />
      <Row label="Checked Out By" value={pkg.checkedOutBy?.fullName ?? '—'} />
      <Row
        label="Delivered to Office"
        value={pkg.deliveredToOffice ? '✓ Yes' : '✗ No'}
      />
      <Row label="Last Updated" value={formatDate(pkg.updatedAt)} />
    </div>
  );
}

// ─── Tab: Recipient ───────────────────────────────────────────────────────────

function RecipientTab({ pkg }: { pkg: Package }) {
  // TODO: this tab will be expanded once the department database is connected
  return (
    <div className="space-y-1">
      <Row label="Name" value={pkg.recipient?.fullName ?? '—'} />
      <Row label="Net ID" value={pkg.recipient?.netId ?? '—'} />
      <Row label="Email" value={pkg.recipient?.email ?? '—'} />
      <Row label="Role" value={pkg.recipient?.role ?? '—'} />

      {pkg.recipient?.email && (
        <div className="pt-3">
          <a
            href={`mailto:${pkg.recipient.email}?subject=Package Notification`}
            className="inline-block rounded-lg bg-byu-royal px-4 py-2 text-sm text-white hover:bg-[#003a9a] transition"
          >
            Send Email
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Shared within file ───────────────────────────────────────────────────────

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 py-2 gap-4">
      <span className="text-sm font-medium text-byu-navy shrink-0">{label}</span>
      <span className="text-sm text-gray-700 text-right">{value}</span>
    </div>
  );
}