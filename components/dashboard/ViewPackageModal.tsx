'use client';

import { useState } from 'react';
import type { Package } from '@/types/package';
import { formatDate } from '@/utils/formatDate';
import { daysAgo } from '@/utils/daysAgo';
import TabModal, { type TabConfig } from '@/components/general/overlays/TabModal';
import Button from '@/components/general/actions/Button';
import SendEmailModal from '@/components/general/overlays/SendEmailModal';
import { sendNotification } from '@/lib/api/notifications';

interface ViewPackageModalProps {
  onClose: () => void;
  pkg: Package | null;
  /** Called after a follow-up email is sent so the parent can refetch. */
  onSuccess?: () => void | Promise<void>;
}

export default function ViewPackageModal({ onClose, pkg, onSuccess }: ViewPackageModalProps) {
  const [activeTab, setActiveTab] = useState('notification');
  const [sendEmailOpen, setSendEmailOpen] = useState(false);

  if (!pkg) return null;

  const arrivedAgo = daysAgo(pkg.dateArrived);

  const notifications = pkg.notifications ?? [];
  const latestNotification = notifications[0];
  const latestIsFollowUp = latestNotification?.type === 'FOLLOW_UP';
  const hasSent = notifications.length > 0;

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
                <p className="text-xs font-medium text-gray-500">Vendor</p>
                <p className="text-byu-navy">{pkg.vendor?.name ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Notification status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-byu-navy">Email Notification</span>
              <span className={`text-sm ${hasSent ? 'text-green-600' : 'text-gray-400'}`}>
                {hasSent ? '✓ Sent' : '✗ Not sent'}
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
          recipient={{
            name: pkg.recipient?.fullName,
            email: pkg.recipient?.email ?? '',
          }}
          defaultSubject="Package Reminder"
          defaultBody={
            `This is a friendly reminder that your package is still waiting for pickup at the ECE mailroom.\n\n` +
            `Please stop by at your earliest convenience.`
          }
          title="Send Follow-Up Email"
          onSend={(payload) =>
            sendNotification({
              to: payload.to,
              subject: payload.subject,
              body: payload.body,
              recipientName: pkg.recipient?.fullName,
              packageId: pkg.id,
              recipientId: pkg.recipientId,
              type: 'FOLLOW_UP',
            })
          }
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