import React, { useState } from 'react';
import type { Package } from '@/types/package';
import { formatDate } from '@/utils/formatDate';

interface ViewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package | null;
}

const ViewPackageModal: React.FC<ViewPackageModalProps> = ({
  isOpen,
  onClose,
  package: pkg,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'tracking' | 'student'>('details');

  if (!isOpen || !pkg) return null;

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
            onClick={() => setActiveTab('student')}
            className={`px-3 py-1 ${activeTab === 'student' ? 'border-b-2 border-byuNavy text-byuNavy font-semibold' : 'text-gray-500'}`}
          >
            Student Info
          </button>
        </div>

        {/* Tab Content */}
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-2">
            {/* Status */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Status</span>
              <span className="text-sm text-gray-700 font-semibold">
                {pkg.status.replace('_', ' ')}
              </span>
            </div>

            {/* Tracking Number */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Tracking Number</span>
              <span className="text-sm text-gray-700">
                {pkg.trackingNumber || '—'}
              </span>
            </div>

            {/* Carrier */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Carrier</span>
              <span className="text-sm text-gray-700">
                {pkg.carrier || '—'}
              </span>
            </div>

            {/* Sender */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Sender/Vendor</span>
              <span className="text-sm text-gray-700">
                {pkg.sender || '—'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Storage Location</span>
              <span className="text-sm text-gray-700">
                {pkg.location || '—'}
              </span>
            </div>

            {/* Expected Arrival */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Expected Arrival</span>
              <span className="text-sm text-gray-700">
                {pkg.expectedArrivalDate ? formatDate(pkg.expectedArrivalDate) : '—'}
              </span>
            </div>

            {/* Notification Status */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Student Notified</span>
              <span className="text-sm text-gray-700">
                {pkg.notificationSent ? '✓ Yes' : '✗ No'}
              </span>
            </div>

            {/* Notes */}
            {pkg.notes && (
              <div className="py-2 border-b border-gray-200">
                <span className="block text-sm font-medium text-byuNavy mb-1">
                  Internal Notes:
                </span>
                <span className="block text-sm text-gray-700 whitespace-pre-wrap">
                  {pkg.notes}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-2">
            {/* Created Date */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Created</span>
              <span className="text-sm text-gray-700">
                {formatDate(pkg.createdAt)}
              </span>
            </div>

            {/* Date Arrived */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Date Arrived</span>
              <span className="text-sm text-gray-700">
                {pkg.dateArrived ? formatDate(pkg.dateArrived) : '—'}
              </span>
            </div>

            {/* Checked In By */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Checked In By</span>
              <span className="text-sm text-gray-700">
                {pkg.checkedInBy ? pkg.checkedInBy.fullName : '—'}
              </span>
            </div>

            {/* Date Picked Up */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Date Picked Up</span>
              <span className="text-sm text-gray-700">
                {pkg.datePickedUp ? formatDate(pkg.datePickedUp) : '—'}
              </span>
            </div>

            {/* Checked Out By */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Checked Out By</span>
              <span className="text-sm text-gray-700">
                {pkg.checkedOutBy ? pkg.checkedOutBy.fullName : '—'}
              </span>
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Last Updated</span>
              <span className="text-sm text-gray-700">
                {formatDate(pkg.updatedAt)}
              </span>
            </div>

            {/* Visual Timeline */}
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h3 className="text-sm font-semibold text-byuNavy mb-4">Package Timeline</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                
                <div className="space-y-4">
                  {/* Created */}
                  <div className="relative flex items-start">
                    <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-byuNavy"></div>
                    <div className="ml-10">
                      <div className="text-sm font-medium text-byuNavy">Package Created</div>
                      <div className="text-xs text-gray-600">{formatDate(pkg.createdAt)}</div>
                    </div>
                  </div>

                  {/* Arrived */}
                  {pkg.dateArrived && (
                    <div className="relative flex items-start">
                      <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="ml-10">
                        <div className="text-sm font-medium text-byuNavy">Package Arrived</div>
                        <div className="text-xs text-gray-600">{formatDate(pkg.dateArrived)}</div>
                        {pkg.checkedInBy && (
                          <div className="text-xs text-gray-500">by {pkg.checkedInBy.fullName}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Picked Up */}
                  {pkg.datePickedUp && (
                    <div className="relative flex items-start">
                      <div className="absolute left-4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-10">
                        <div className="text-sm font-medium text-byuNavy">Package Picked Up</div>
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

        {/* Student Info Tab */}
        {activeTab === 'student' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Name</span>
              <span className="text-sm text-gray-700">
                {pkg.student?.fullName || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Email</span>
              <span className="text-sm text-gray-700">
                {pkg.student?.email || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">BYU Net ID</span>
              <span className="text-sm text-gray-700">
                {pkg.student?.netId || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-byuNavy">Role</span>
              <span className="text-sm text-gray-700">
                {pkg.student?.role || '—'}
              </span>
            </div>

            {/* Contact Actions */}
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h3 className="text-sm font-semibold text-byuNavy mb-3">Contact Student</h3>
              <div className="flex gap-3">
                {pkg.student?.email && (
                  <a
                    href={`mailto:${pkg.student.email}?subject=Package Notification - Tracking ${pkg.trackingNumber || 'N/A'}`}
                    className="px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a] text-sm"
                  >
                    Send Email
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Close button */}
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