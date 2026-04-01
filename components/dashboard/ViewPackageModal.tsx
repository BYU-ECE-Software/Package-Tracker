'use client';

import React, { useState } from 'react';
import type { Package } from '@/types/package';
import { formatDate } from '@/utils/formatDate';

interface ViewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package | null;
}

const ViewPackageModal: React.FC<ViewPackageModalProps> = ({
  isOpen,
  onClose,
  pkg,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'tracking' | 'recipient'>('details');

  if (!isOpen || !pkg) return null;

  const isCheckedOut = pkg.datePickedUp !== null || pkg.deliveredToOffice;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-byuNavy mb-4">Package Details</h2>

        {/* Status badge */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded text-xs font-medium ${
            isCheckedOut
              ? 'bg-byuGreenBright text-white'
              : 'bg-byuYellowBright text-byuDarkGray'
          }`}>
            {isCheckedOut ? 'Checked Out' : 'Active'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-4 mb-4 border-b pb-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1 ${activeTab === 'details' ? 'border-b-2 border-byuNavy text-byuNavy font-semibold' : 'text-gray-500'}`}
          >
            Package Details
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 py-1 ${activeTab === 'tracking' ? 'border-b-2 border-byuNavy text-byuNavy font-semibold' : 'text-gray-500'}`}
          >
            Tracking & History
          </button>
          <button
            onClick={() => setActiveTab('recipient')}
            className={`px-3 py-1 ${activeTab === 'recipient' ? 'border-b-2 border-byuNavy text-byuNavy font-semibold' : 'text-gray-500'}`}
          >
            Recipient Info
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Carrier</span>
              <span className="text-sm text-gray-700">{pkg.carrier?.name ?? '—'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Sender</span>
              <span className="text-sm text-gray-700">{pkg.sender?.name ?? '—'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Recipient Notified</span>
              <span className="text-sm text-gray-700">{pkg.notificationSent ? '✓ Yes' : '✗ No'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Delivered to Office</span>
              <span className="text-sm text-gray-700">{pkg.deliveredToOffice ? '✓ Yes' : '✗ No'}</span>
            </div>

            {pkg.notes && (
              <div className="py-2 border-b border-gray-200">
                <span className="block text-sm font-medium text-byuNavy mb-1">Internal Notes</span>
                <span className="block text-sm text-gray-700 whitespace-pre-wrap">{pkg.notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Created</span>
              <span className="text-sm text-gray-700">{formatDate(pkg.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Date Arrived</span>
              <span className="text-sm text-gray-700">{formatDate(pkg.dateArrived)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Logged By</span>
              <span className="text-sm text-gray-700">{pkg.checkedInBy?.fullName ?? '—'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Date Picked Up</span>
              <span className="text-sm text-gray-700">{pkg.datePickedUp ? formatDate(pkg.datePickedUp) : '—'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Checked Out By</span>
              <span className="text-sm text-gray-700">{pkg.checkedOutBy?.fullName ?? '—'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Last Updated</span>
              <span className="text-sm text-gray-700">{formatDate(pkg.updatedAt)}</span>
            </div>

            {/* Visual Timeline */}
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h3 className="text-sm font-semibold text-byuNavy mb-4">Package Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />
                <div className="space-y-4">
                  <div className="relative flex items-start">
                    <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-byuNavy" />
                    <div className="ml-10">
                      <div className="text-sm font-medium text-byuNavy">Package Logged</div>
                      <div className="text-xs text-gray-600">{formatDate(pkg.createdAt)}</div>
                    </div>
                  </div>

                  {pkg.dateArrived && (
                    <div className="relative flex items-start">
                      <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-byuYellowBright" />
                      <div className="ml-10">
                        <div className="text-sm font-medium text-byuNavy">Package Arrived</div>
                        <div className="text-xs text-gray-600">{formatDate(pkg.dateArrived)}</div>
                        {pkg.checkedInBy && (
                          <div className="text-xs text-gray-500">logged by {pkg.checkedInBy.fullName}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {pkg.deliveredToOffice && (
                    <div className="relative flex items-start">
                      <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-byuGreenBright" />
                      <div className="ml-10">
                        <div className="text-sm font-medium text-byuNavy">Delivered to Office</div>
                        {pkg.checkedOutBy && (
                          <div className="text-xs text-gray-500">by {pkg.checkedOutBy.fullName}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {pkg.datePickedUp && (
                    <div className="relative flex items-start">
                      <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-byuGreenBright" />
                      <div className="ml-10">
                        <div className="text-sm font-medium text-byuNavy">Picked Up</div>
                        <div className="text-xs text-gray-600">{formatDate(pkg.datePickedUp)}</div>
                        {pkg.checkedOutBy && (
                          <div className="text-xs text-gray-500">by {pkg.checkedOutBy.fullName}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recipient Tab */}
        {activeTab === 'recipient' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Name</span>
              <span className="text-sm text-gray-700">{pkg.recipient?.fullName ?? '—'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Email</span>
              <span className="text-sm text-gray-700">{pkg.recipient?.email ?? '—'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">BYU Net ID</span>
              <span className="text-sm text-gray-700">{pkg.recipient?.netId ?? '—'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Role</span>
              <span className="text-sm text-gray-700">{pkg.recipient?.role ?? '—'}</span>
            </div>

            {pkg.recipient?.email && (
              <div className="mt-6 p-4 bg-gray-50 rounded border">
                <h3 className="text-sm font-semibold text-byuNavy mb-3">Contact Recipient</h3>
                  <a
                    href={`mailto:${pkg.recipient.email}?subject=Package Notification`}
                    className="px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a] text-sm inline-block"
                  >
                    Send Email
                  </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPackageModal;