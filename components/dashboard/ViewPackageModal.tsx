'use client';

import { useState } from 'react';
import type { Package } from '@/types/package';
import { formatDate } from '@/utils/formatDate';
import TabModal, { type TabConfig } from '@/components/ui/modals/TabModal';
import Button from '@/components/ui/Button';
import SendEmailModal from './SendEmailModal';

interface ViewPackageModalProps {
  onClose: () => void;
  pkg: Package | null;
  /** Called after a follow-up email is sent so the parent can refetch. */
  onSuccess?: () => void | Promise<void>;
}

function daysAgo(dateStr: Date | string | null | undefined): string | null {
  if (!dateStr) return null;
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

export default function ViewPackageModal({ onClose, pkg, onSuccess }: ViewPackageModalProps) {
  const [activeTab, setActiveTab] = useState('notification');
  const [sendEmailOpen, setSendEmailOpen] = useState(false);

  if (!pkg) return null;

  const arrivedAgo = daysAgo(pkg.dateArrived);

  // Notifications come back ordered newest-first from the API. Classify the
  // latest one by its subject — anything mentioning "reminder" or "follow-up"
  // is a follow-up; otherwise it's the package arrival notification.
  const notifications = pkg.notifications ?? [];
  const latestNotification = notifications[0];
  const latestIsFollowUp = latestNotification
    ? /reminder|follow.?up/i.test(latestNotification.subject)
    : false;

  const tabs: TabConfig[] = [
    {
      key: 'notification',
      label: 'Notification',
      content: (
        <div className="space-y-6">
          {/* Package summary */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500">Name</p>
                <p className="text-byu-navy font-medium">
                  {pkg.recipient?.fullName ?? '—'}
                  <span className="ml-1 font-normal text-gray-500">
                    ({pkg.recipient?.netId ?? '—'})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Date</p>
                <p className="text-byu-navy">
                  {formatDate(pkg.dateArrived)}
                  {arrivedAgo && (
                    <span className="ml-2 text-gray-400">({arrivedAgo})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Carrier</p>
                <p className="text-byu-navy">{pkg.carrier?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Sender</p>
                <p className="text-byu-navy">{pkg.sender?.name ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Notification status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-byu-navy">Email Notification</span>
              <span className={`text-sm ${pkg.notificationSent ? 'text-green-600' : 'text-gray-400'}`}>
                {pkg.notificationSent ? '✓ Sent' : '✗ Not sent'}
              </span>
            </div>

            {latestNotification && (
              <p className="text-xs text-gray-500">
                Sent {daysAgo(latestNotification.sentAt)} —{' '}
                {latestIsFollowUp ? 'follow-up reminder' : 'package arrival notification'}
              </p>
            )}

            {/* Send follow-up button */}
            {pkg.recipient?.email ? (
              <div className="pt-2">
                <Button
                  onClick={() => setSendEmailOpen(true)}
                  label="Send Follow-Up Email"
                  variant="primary"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Will send to: {pkg.recipient.email}
                </p>
              </div>
            ) : (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                ⚠️ No email on file for this recipient
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      content: (
        <div className="space-y-4">
          <Row label="Checked in by" value={pkg.checkedInBy?.fullName ?? '—'} />
          <Row label="Date Added" value={formatDate(pkg.dateArrived)} />

          {pkg.datePickedUp && (
            <>
              <Row label="Checked out by" value={pkg.checkedOutBy?.fullName ?? '—'} />
              <Row label="Date Checked Out" value={formatDate(pkg.datePickedUp)} />
              {pkg.pickedUpBy && pkg.pickedUpBy.id !== pkg.recipient?.id && (
                <Row 
                  label="Picked Up By" 
                  value={`${pkg.pickedUpBy.fullName} (not recipient)`} 
                />
              )}
              {pkg.deliveredToOffice && (
                <Row label="Delivery Method" value="Delivered to Office" />
              )}
            </>
          )}

          {pkg.notes && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 px-3 py-2 rounded">
                {pkg.notes}
              </p>
            </div>
          )}

          {!pkg.notes && (
            <p className="text-xs text-gray-400 italic pt-3 border-t border-gray-100">
              No notes recorded
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <TabModal
        open={true}
        title="Package Details"
        size="md"
        onClose={onClose}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose} label="Close" />
          </div>
        }
      />

      {sendEmailOpen && (
        <SendEmailModal
          pkg={pkg}
          onClose={() => setSendEmailOpen(false)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 pb-2 gap-4">
      <span className="text-sm font-medium text-byu-navy shrink-0">{label}</span>
      <span className="text-sm text-gray-700 text-right">{value}</span>
    </div>
  );
}