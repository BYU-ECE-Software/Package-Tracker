'use client';

import React, { useState } from 'react';
import type { Package } from '@/types/package';
import type { User } from '@/types/user';
import type { ToastProps } from '@/types/toast';
import { checkOutPackage, updatePackage } from '@/lib/api/packages';
import Toast from '@/components/shared/Toast';

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package;
  secretaries: User[];
  onSuccess: () => Promise<void>;
}

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  pkg,
  secretaries,
  onSuccess,
}) => {
  const [checkedOutById, setCheckedOutById] = useState('');
  const [pickedUpById, setPickedUpById] = useState('');
  const [deliveredToOffice, setDeliveredToOffice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const handleDeliveredToOfficeChange = (checked: boolean) => {
    setDeliveredToOffice(checked);
    if (checked) setPickedUpById(''); // clear pickup if delivered to office
  };

  const handlePickedUpByChange = (id: string) => {
    setPickedUpById(id);
    if (id) setDeliveredToOffice(false); // uncheck delivered to office if pickup selected
  };

  const handleSubmit = async () => {
    if (!checkedOutById) {
      setToast({
        type: 'error',
        title: 'Missing Required Field',
        message: 'Please select who is checking out this package.',
      });
      return;
    }

    if (!deliveredToOffice && !pickedUpById) {
      setToast({
        type: 'error',
        title: 'Missing Required Field',
        message: 'Please select a pickup recipient or mark as delivered to office.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (deliveredToOffice) {
        await updatePackage(pkg.id, {
          deliveredToOffice: true,
          checkedOutById,
        });
      } else {
        await checkOutPackage(pkg.id, checkedOutById);
      }
      await onSuccess();
    } catch {
      setToast({
        type: 'error',
        title: 'Check Out Failed',
        message: 'Something went wrong while checking out the package.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCheckedOutById('');
    setPickedUpById('');
    setDeliveredToOffice(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg relative overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 z-10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
            disabled={isSubmitting}
          >
            ✕
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-byuNavy pr-8">Check Out Package</h2>
          <p className="text-sm text-gray-500 mt-1">
            For: {pkg.recipient?.fullName ?? 'Unknown'} ({pkg.recipient?.netId ?? '—'})
          </p>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-6">

          {/* Picked Up By */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Picked Up By
            </label>
            <select
              value={pickedUpById}
              onChange={(e) => handlePickedUpByChange(e.target.value)}
              disabled={deliveredToOffice || isSubmitting}
              className={`w-full p-2 sm:p-3 border rounded text-sm focus:ring-2 focus:ring-byuRoyal focus:border-transparent ${
                deliveredToOffice
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-byuNavy'
              }`}
            >
              <option value="">Select recipient</option>
              {/* Put the package recipient at the top */}
              {pkg.recipient && (
                <option value={pkg.recipient.id}>
                  {pkg.recipient.fullName} ({pkg.recipient.netId}) — Expected Recipient
                </option>
              )}
              <option disabled>──────────</option>
              {/* Other users */}
              <option value="other">Someone else picked it up</option>
            </select>
            {deliveredToOffice && (
              <p className="text-xs text-gray-400">Disabled — package is being delivered to office</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Delivered to Office */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Delivered to Office
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="deliveredToOffice"
                checked={deliveredToOffice}
                onChange={(e) => handleDeliveredToOfficeChange(e.target.checked)}
                disabled={!!pickedUpById || isSubmitting}
                className={`h-5 w-5 ${
                  pickedUpById ? 'cursor-not-allowed opacity-50' : 'text-byuRoyal cursor-pointer'
                }`}
              />
              <label
                htmlFor="deliveredToOffice"
                className={`text-sm ${pickedUpById ? 'text-gray-400' : 'text-byuNavy cursor-pointer'}`}
              >
                Package was delivered directly to a professor's office
              </label>
            </div>
            {pickedUpById && (
              <p className="text-xs text-gray-400">Disabled — a recipient has been selected</p>
            )}
          </div>

          {/* Checked Out By (secretary) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Checked Out By <span className="text-red-600">*</span>
            </label>
            <select
              value={checkedOutById}
              onChange={(e) => setCheckedOutById(e.target.value)}
              disabled={isSubmitting}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byuNavy focus:ring-2 focus:ring-byuRoyal focus:border-transparent"
            >
              <option value="">Select a secretary</option>
              {secretaries.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName}</option>
              ))}
            </select>
            {checkedOutById && (
              <p className="text-xs text-gray-500">
                Checking out as {secretaries.find(s => s.id === checkedOutById)?.fullName}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 bg-byuNavy text-white rounded hover:bg-[#001F40] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking Out...
              </>
            ) : 'Check Out Package'}
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

export default CheckOutModal;