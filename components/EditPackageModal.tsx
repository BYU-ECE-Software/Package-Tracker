import React, { useEffect, useState } from 'react';
import type { Package, PackageStatus, User } from '@/types/package';
import Toast from './Toast';
import type { ToastProps } from '@/types/toast';

interface EditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
  users: User[];
  onPackageFieldChange: (field: string, value: any) => void;
  onSave: () => void;
}

// Package status options
const statusOptions: PackageStatus[] = [
  'AWAITING_ARRIVAL',
  'ARRIVED',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'RETURNED_TO_SENDER',
  'LOST',
];

// Carrier options
const carrierOptions = [
  'UPS',
  'FedEx',
  'USPS',
  'DHL',
  'Amazon',
  'Other',
];

const EditPackageModal: React.FC<EditPackageModalProps> = ({
  isOpen,
  onClose,
  package: pkg,
  users,
  onPackageFieldChange,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'tracking'>('details');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose' | 'duration'> | null>(null);

  // Filter users by role
  const students = users.filter((u) => u.role === 'STUDENT');
  const employees = users.filter((u) => u.role === 'SECRETARY' || u.role === 'ADMIN');

  // Required fields
  const REQUIRED_FIELDS = [
    { key: 'studentId', label: 'Student', section: 'details' as const },
    { key: 'status', label: 'Status', section: 'details' as const },
  ];

  // Helper to validate and save
  const attemptSave = () => {
    const missing = REQUIRED_FIELDS.filter(({ key }) => {
      const v = (pkg as any)[key];
      return (
        v === null ||
        v === undefined ||
        (typeof v === 'string' && v.trim() === '')
      );
    });

    if (missing.length) {
      const first = missing[0];
      if (first.section !== activeTab) setActiveTab(first.section);

      setTimeout(() => {
        const el = document.getElementById(`package-${first.key}`) as HTMLElement | null;
        el?.focus();
      }, 0);

      setToast({
        type: 'error',
        title: 'Missing required fields',
        message: `Please fill: ${missing.map((m) => m.label).join(', ')}`,
      });
      return;
    }

    onSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-byuNavy mb-4 pt-6">Edit Package</h2>

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
        </div>

        {/* Tab Content */}
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-3">
            {/* Row: Student */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Student <span className="text-red-600">*</span>
              </label>
              <select
                id="package-studentId"
                value={pkg.studentId ?? ''}
                onChange={(e) => onPackageFieldChange('studentId', e.target.value)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              >
                <option value="" disabled hidden>
                  Select a student
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.netId})
                  </option>
                ))}
              </select>
            </div>

            {/* Row: Status */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Status <span className="text-red-600">*</span>
              </label>
              <select
                id="package-status"
                value={pkg.status}
                onChange={(e) => onPackageFieldChange('status', e.target.value)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Row: Tracking Number */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Tracking Number
              </label>
              <input
                type="text"
                value={pkg.trackingNumber ?? ''}
                onChange={(e) => onPackageFieldChange('trackingNumber', e.target.value)}
                placeholder="Enter tracking number"
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Carrier */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Carrier
              </label>
              <select
                value={pkg.carrier ?? ''}
                onChange={(e) => onPackageFieldChange('carrier', e.target.value)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              >
                <option value="">Select carrier</option>
                {carrierOptions.map((carrier) => (
                  <option key={carrier} value={carrier}>
                    {carrier}
                  </option>
                ))}
              </select>
            </div>

            {/* Row: Sender */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Sender/Vendor
              </label>
              <input
                type="text"
                value={pkg.sender ?? ''}
                onChange={(e) => onPackageFieldChange('sender', e.target.value)}
                placeholder="e.g., Amazon, BYU Store"
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Location */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Storage Location
              </label>
              <input
                type="text"
                value={pkg.location ?? ''}
                onChange={(e) => onPackageFieldChange('location', e.target.value)}
                placeholder="e.g., Shelf A3, Bin 5"
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Expected Arrival Date */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Expected Arrival Date
              </label>
              <input
                type="date"
                value={pkg.expectedArrivalDate ? new Date(pkg.expectedArrivalDate).toISOString().slice(0, 10) : ''}
                onChange={(e) => onPackageFieldChange('expectedArrivalDate', e.target.value ? new Date(e.target.value) : null)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Notification Sent */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Student Notified
              </label>
              <input
                type="checkbox"
                checked={pkg.notificationSent}
                onChange={(e) => onPackageFieldChange('notificationSent', e.target.checked)}
                className="h-5 w-5 text-byuRoyal"
              />
            </div>

            {/* Row: Notes */}
            <div className="py-2">
              <label className="text-sm font-medium text-byuNavy block mb-2">
                Internal Notes
              </label>
              <textarea
                value={pkg.notes ?? ''}
                onChange={(e) => onPackageFieldChange('notes', e.target.value)}
                placeholder="Any internal notes about this package..."
                className="w-full border border-gray-300 rounded p-2 resize-y min-h-[80px] text-sm text-byuNavy"
              />
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-3">
            {/* Row: Date Arrived */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Date Arrived
              </label>
              <input
                type="date"
                value={pkg.dateArrived ? new Date(pkg.dateArrived).toISOString().slice(0, 10) : ''}
                onChange={(e) => onPackageFieldChange('dateArrived', e.target.value ? new Date(e.target.value) : null)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Checked In By */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Checked In By
              </label>
              <select
                value={pkg.checkedInById ?? ''}
                onChange={(e) => onPackageFieldChange('checkedInById', e.target.value || null)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              >
                <option value="">Not checked in yet</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Row: Date Picked Up */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Date Picked Up
              </label>
              <input
                type="date"
                value={pkg.datePickedUp ? new Date(pkg.datePickedUp).toISOString().slice(0, 10) : ''}
                onChange={(e) => onPackageFieldChange('datePickedUp', e.target.value ? new Date(e.target.value) : null)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              />
            </div>

            {/* Row: Checked Out By */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byuNavy">
                Checked Out By
              </label>
              <select
                value={pkg.checkedOutById ?? ''}
                onChange={(e) => onPackageFieldChange('checkedOutById', e.target.value || null)}
                className="p-2 border rounded text-sm text-byuNavy w-1/2"
              >
                <option value="">Not checked out yet</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeline Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h3 className="text-sm font-semibold text-byuNavy mb-3">Package Timeline</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">
                    {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {pkg.expectedArrivalDate && (
                  <div className="flex justify-between">
                    <span>Expected Arrival:</span>
                    <span className="font-medium">
                      {new Date(pkg.expectedArrivalDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {pkg.dateArrived && (
                  <div className="flex justify-between">
                    <span>Arrived:</span>
                    <span className="font-medium">
                      {new Date(pkg.dateArrived).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {pkg.datePickedUp && (
                  <div className="flex justify-between">
                    <span>Picked Up:</span>
                    <span className="font-medium">
                      {new Date(pkg.datePickedUp).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save and cancel buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={attemptSave}
            className="px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a]"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Toast */}
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
    </div>
  );
};

export default EditPackageModal;