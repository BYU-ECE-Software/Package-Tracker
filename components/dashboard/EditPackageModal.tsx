'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { Package, UpdatePackageRequest } from '@/types/package';
import type { Carrier } from '@/types/carrier';
import type { Sender } from '@/types/sender';
import type { ToastProps } from '@/types/toast';
import { updatePackage } from '@/lib/api/packages';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import Toast from '@/components/shared/Toast';

interface EditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package;
  recipients: User[];
  secretaries: User[];
  onSuccess: () => Promise<void>;
}

const EditPackageModal: React.FC<EditPackageModalProps> = ({
  isOpen,
  onClose,
  pkg,
  secretaries,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'tracking'>('details');
  const [formData, setFormData] = useState<UpdatePackageRequest>({});
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Load carriers and senders on mount
  useEffect(() => {
    fetchCarriers(true).then(setCarriers).catch(console.error);
    fetchSenders(true).then(setSenders).catch(console.error);
  }, []);

  // Initialize form data from package
  useEffect(() => {
    setFormData({
      carrierId: pkg.carrierId ?? undefined,
      senderId: pkg.senderId ?? undefined,
      dateArrived: pkg.dateArrived
        ? new Date(pkg.dateArrived).toISOString().slice(0, 10)
        : undefined,
      datePickedUp: pkg.datePickedUp
        ? new Date(pkg.datePickedUp).toISOString().slice(0, 10)
        : undefined,
      checkedInById: pkg.checkedInById ?? undefined,
      checkedOutById: pkg.checkedOutById ?? undefined,
      deliveredToOffice: pkg.deliveredToOffice,
      notes: pkg.notes ?? undefined,
      notificationSent: pkg.notificationSent,
    });
  }, [pkg]);

  const handleChange = <K extends keyof UpdatePackageRequest>(field: K, value: UpdatePackageRequest[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updatePackage(pkg.id, formData);
      await onSuccess();
    } catch {
      setToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Something went wrong while updating the package.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
          disabled={isSubmitting}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-byu-navy mb-4 pt-6">Edit Package</h2>

        {/* Tab Switcher */}
        <div className="flex space-x-4 mb-4 border-b pb-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1 ${activeTab === 'details' ? 'border-b-2 border-byu-navy text-byu-navy font-semibold' : 'text-gray-500'}`}
          >
            Package Details
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 py-1 ${activeTab === 'tracking' ? 'border-b-2 border-byu-navy text-byu-navy font-semibold' : 'text-gray-500'}`}
          >
            Tracking & History
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-3">

            {/* Recipient */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Recipient</label>
              <select
                value={pkg.recipientId}
                disabled
                className="p-2 border rounded text-sm text-gray-400 w-1/2 bg-gray-50 cursor-not-allowed"
              >
                <option value={pkg.recipientId}>
                  {pkg.recipient?.fullName} ({pkg.recipient?.netId})
                </option>
              </select>
            </div>

            {/* Carrier */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Carrier</label>
              <select
                value={formData.carrierId ?? ''}
                onChange={(e) => handleChange('carrierId', e.target.value || undefined)}
                className="p-2 border rounded text-sm text-byu-navy w-1/2"
                disabled={isSubmitting}
              >
                <option value="">Select carrier</option>
                {carriers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sender */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Sender</label>
              <select
                value={formData.senderId ?? ''}
                onChange={(e) => handleChange('senderId', e.target.value || undefined)}
                className="p-2 border rounded text-sm text-byu-navy w-1/2"
                disabled={isSubmitting}
              >
                <option value="">Select sender</option>
                {senders.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Notification Sent */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Recipient Notified</label>
              <input
                type="checkbox"
                checked={formData.notificationSent ?? false}
                onChange={(e) => handleChange('notificationSent', e.target.checked)}
                className="h-5 w-5 text-byu-royal"
                disabled={isSubmitting}
              />
            </div>

            {/* Notes */}
            <div className="py-2">
              <label className="text-sm font-medium text-byu-navy block mb-2">
                Internal Notes
              </label>
              <textarea
                value={formData.notes ?? ''}
                onChange={(e) => handleChange('notes', e.target.value || undefined)}
                placeholder="Any internal notes about this package..."
                className="w-full border border-gray-300 rounded p-2 resize-y min-h-[80px] text-sm text-byu-navy"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-3">

            {/* Date Arrived */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Date Arrived</label>
              <input
                type="date"
                value={formData.dateArrived ?? ''}
                onChange={(e) => handleChange('dateArrived', e.target.value || undefined)}
                className="p-2 border rounded text-sm text-byu-navy w-1/2"
                disabled={isSubmitting}
              />
            </div>

            {/* Checked In By */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Logged By</label>
              <select
                value={formData.checkedInById ?? ''}
                onChange={(e) => handleChange('checkedInById', e.target.value || undefined)}
                className="p-2 border rounded text-sm text-byu-navy w-1/2"
                disabled={isSubmitting}
              >
                <option value="">Not logged yet</option>
                {secretaries.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </div>

            {/* Date Picked Up */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Date Picked Up</label>
              <input
                type="date"
                value={formData.datePickedUp ?? ''}
                onChange={(e) => handleChange('datePickedUp', e.target.value || undefined)}
                className="p-2 border rounded text-sm text-byu-navy w-1/2"
                disabled={isSubmitting}
              />
            </div>

            {/* Checked Out By */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Checked Out By</label>
              <select
                value={formData.checkedOutById ?? ''}
                onChange={(e) => handleChange('checkedOutById', e.target.value || undefined)}
                className="p-2 border rounded text-sm text-byu-navy w-1/2"
                disabled={isSubmitting}
              >
                <option value="">Not checked out yet</option>
                {secretaries.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            </div>

            {/* Delivered to Office */}
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <label className="text-sm font-medium text-byu-navy">Delivered to Office</label>
              <input
                type="checkbox"
                checked={formData.deliveredToOffice ?? false}
                onChange={(e) => handleChange('deliveredToOffice', e.target.checked)}
                className="h-5 w-5 text-byu-royal"
                disabled={isSubmitting}
              />
            </div>

            {/* Timeline Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h3 className="text-sm font-semibold text-byu-navy mb-3">Package Timeline</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">
                    {new Date(pkg.createdAt).toLocaleDateString()}
                  </span>
                </div>
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
                {pkg.deliveredToOffice && (
                  <div className="flex justify-between">
                    <span>Delivered to Office:</span>
                    <span className="font-medium text-byu-green-bright">Yes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-byu-royal text-white rounded hover:bg-[#003a9a] disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EditPackageModal;