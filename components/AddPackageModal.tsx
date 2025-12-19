// ============================================
// 1. AddPackageModal.tsx Component
// ============================================

import React, { useState } from 'react';
import type { User, PackageStatus } from '@/types/package';
import Toast from './Toast';
import type { ToastProps } from '@/types/toast';
import type { AddPackageData } from '@/types/package';

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSave: (packageData: AddPackageData) => Promise<void>;
}

const carrierOptions = [
  'UPS',
  'FedEx',
  'USPS',
  'DHL',
  'Amazon',
  'Other',
];

const AddPackageModal: React.FC<AddPackageModalProps> = ({
  isOpen,
  onClose,
  users,
  onSave,
}) => {
  const [formData, setFormData] = useState<AddPackageData>({
    studentId: '',
    trackingNumber: '',
    carrier: '',
    sender: '',
    expectedArrivalDate: '',
    location: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose' | 'duration'> | null>(null);

  // Filter for students only
  const students = users.filter((u) => u.role === 'STUDENT');

  const handleChange = (field: keyof AddPackageData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      trackingNumber: '',
      carrier: '',
      sender: '',
      expectedArrivalDate: '',
      location: '',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.studentId) {
      setToast({
        type: 'error',
        title: 'Missing Required Field',
        message: 'Please select a student.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to add package:', error);
      setToast({
        type: 'error',
        title: 'Add Package Failed',
        message: 'Something went wrong while adding the package.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg relative overflow-y-auto max-h-[90vh]">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 bg-white border-b p-4 sm:p-6 z-10">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
            disabled={isSubmitting}
          >
            ✕
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-byuNavy pr-8">Add New Package</h2>
        </div>

        {/* Form Content - Scrollable */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Student Selection - Required */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Student <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byuNavy focus:ring-2 focus:ring-byuRoyal focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.netId})
                </option>
              ))}
            </select>
          </div>

          {/* Tracking Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Tracking Number
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => handleChange('trackingNumber', e.target.value)}
              placeholder="Enter tracking number"
              className="w-full p-2 sm:p-3 border rounded text-sm text-byuNavy focus:ring-2 focus:ring-byuRoyal focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Carrier */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Carrier
            </label>
            <select
              value={formData.carrier}
              onChange={(e) => handleChange('carrier', e.target.value)}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byuNavy focus:ring-2 focus:ring-byuRoyal focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select carrier</option>
              {carrierOptions.map((carrier) => (
                <option key={carrier} value={carrier}>
                  {carrier}
                </option>
              ))}
            </select>
          </div>

          {/* Sender/Vendor */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Sender/Vendor
            </label>
            <input
              type="text"
              value={formData.sender}
              onChange={(e) => handleChange('sender', e.target.value)}
              placeholder="e.g., Amazon, BYU Store"
              className="w-full p-2 sm:p-3 border rounded text-sm text-byuNavy focus:ring-2 focus:ring-byuRoyal focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Expected Arrival Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Expected Arrival Date
            </label>
            <input
              type="date"
              value={formData.expectedArrivalDate}
              onChange={(e) => handleChange('expectedArrivalDate', e.target.value)}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byuNavy focus:ring-2 focus:ring-byuRoyal focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Storage Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Storage Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Shelf A3, Bin 5"
              className="w-full p-2 sm:p-3 border rounded text-sm text-byuNavy focus:ring-2 focus:ring-byuRoyal focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-byuNavy">
              Internal Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any internal notes about this package..."
              rows={3}
              className="w-full p-2 sm:p-3 border rounded text-sm text-byuNavy resize-y focus:ring-2 focus:ring-byuRoyal focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Footer - Sticky on mobile */}
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
            className="w-full sm:w-auto px-4 py-2 bg-byuRoyal text-white rounded hover:bg-[#003a9a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Package'
            )}
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

export default AddPackageModal;