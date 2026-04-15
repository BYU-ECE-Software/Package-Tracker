'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { CreatePackageRequest } from '@/types/package';
import type { Carrier } from '@/types/carrier';
import type { Sender } from '@/types/sender';
import type { ToastProps } from '@/types/toast';
import { createPackage } from '@/lib/api/packages';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import Toast from '@/components/shared/Toast';

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: User[];
  secretaries: User[];
  onSuccess: () => Promise<void>;
}

const AddPackageModal: React.FC<AddPackageModalProps> = ({
  isOpen,
  onClose,
  recipients,
  secretaries,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreatePackageRequest>({
    recipientId: '',
    carrierId: undefined,
    senderId: undefined,
    notes: undefined,
  });

  const [dateArrived, setDateArrived] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [checkedInById, setCheckedInById] = useState('');
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Load carriers and senders on mount
  useEffect(() => {
    fetchCarriers(true).then(setCarriers).catch(console.error);
    fetchSenders(true).then(setSenders).catch(console.error);
  }, []);

  const handleChange = (field: keyof CreatePackageRequest, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value || undefined }));
  };

  const resetForm = () => {
    setFormData({ recipientId: '', carrierId: undefined, senderId: undefined, notes: undefined });
    setDateArrived(new Date().toISOString().split('T')[0]);
    setCheckedInById('');
  };

  const handleSubmit = async () => {
    if (!formData.recipientId) {
      setToast({ type: 'error', title: 'Missing Required Field', message: 'Please select a recipient.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createPackage({
        ...formData,
        dateArrived,
        checkedInById: checkedInById || undefined,
      });
      resetForm();
      await onSuccess();
    } catch {
      setToast({ type: 'error', title: 'Add Package Failed', message: 'Something went wrong while adding the package.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg relative overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 z-10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
            disabled={isSubmitting}
          >
            ✕
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-byu-navy pr-8">Add New Package</h2>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-4">

          {/* Recipient */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byu-navy">
              Recipient <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.recipientId}
              onChange={(e) => handleChange('recipientId', e.target.value)}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byu-navy focus:ring-2 focus:ring-byu-royal focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select a recipient</option>
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName} ({r.netId})
                </option>
              ))}
            </select>
          </div>

          {/* Carrier */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byu-navy">Carrier</label>
            <select
              value={formData.carrierId ?? ''}
              onChange={(e) => handleChange('carrierId', e.target.value)}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byu-navy focus:ring-2 focus:ring-byu-royal focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select a carrier</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sender */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byu-navy">Sender</label>
            <select
              value={formData.senderId ?? ''}
              onChange={(e) => handleChange('senderId', e.target.value)}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byu-navy focus:ring-2 focus:ring-byu-royal focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select a sender</option>
              {senders.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Arrived */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byu-navy">Date Arrived</label>
            <input
              type="date"
              value={dateArrived}
              onChange={(e) => setDateArrived(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byu-navy focus:ring-2 focus:ring-byu-royal focus:border-transparent"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setDateArrived(new Date().toISOString().split('T')[0])}
              className="mt-1 px-3 py-1 bg-byu-royal text-white rounded hover:bg-[#003a9a] text-sm"
              disabled={isSubmitting}
            >
              Reset to Today
            </button>
          </div>

          {/* Logged By */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byu-navy">Logged By</label>
            <select
              value={checkedInById}
              onChange={(e) => setCheckedInById(e.target.value)}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byu-navy focus:ring-2 focus:ring-byu-royal focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select a secretary</option>
              {secretaries.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
            {checkedInById && (
              <p className="text-xs text-gray-500">
                Creating package as {secretaries.find(s => s.id === checkedInById)?.fullName}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byu-navy">Internal Notes</label>
            <textarea
              value={formData.notes ?? ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any internal notes about this package..."
              rows={3}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byu-navy resize-y focus:ring-2 focus:ring-byu-royal focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-byu-royal text-white rounded hover:bg-[#003a9a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </>
            ) : 'Add Package'}
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

export default AddPackageModal;