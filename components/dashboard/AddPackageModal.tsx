'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { CreatePackageRequest } from '@/types/package';
import type { Carrier } from '@/types/carrier';
import type { Sender } from '@/types/sender';
import { createPackage } from '@/lib/api/packages';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import BaseModal from '@/components/ui/modals/BaseModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddPackageModalProps {
  onClose: () => void;
  recipients: User[];
  secretaries: User[];
  defaultSecretaryId?: string;
  onSuccess: () => Promise<void>;
  // TODO: replace secretaries dropdown with auth session once auth is wired up
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddPackageModal({
  onClose,
  recipients,
  secretaries,
  defaultSecretaryId,
  onSuccess,
}: AddPackageModalProps) {
  const [recipientSearch, setRecipientSearch] = useState('');
  const [formData, setFormData] = useState<CreatePackageRequest>({
    recipientId: '',
    carrierId: undefined,
    senderId: undefined,
    notes: undefined,
  });
  const [dateArrived, setDateArrived] = useState(todayString());
  const [checkedInById, setCheckedInById] = useState(defaultSecretaryId ?? '');
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCarriers(true).then(setCarriers).catch(console.error);
    fetchSenders(true).then(setSenders).catch(console.error);
  }, []);

  // Filter recipients by name or netId as the secretary types
  const filteredRecipients = recipientSearch.trim()
    ? recipients.filter(
        (r) =>
          r.fullName.toLowerCase().includes(recipientSearch.toLowerCase()) ||
          r.netId.toLowerCase().includes(recipientSearch.toLowerCase())
      )
    : recipients;

  const selectedRecipient = recipients.find((r) => r.id === formData.recipientId);

  const handleChange = (
    field: keyof CreatePackageRequest,
    value: string | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const resetForm = () => {
    setRecipientSearch('');
    setFormData({ recipientId: '', carrierId: undefined, senderId: undefined, notes: undefined });
    setDateArrived(todayString());
    setCheckedInById('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid =
    !!formData.recipientId &&
    !!formData.carrierId &&
    !!formData.senderId &&
    !!checkedInById;

  const handleSubmit = async () => {
    // Belt-and-suspenders check; the button should already be disabled if invalid
    if (!isValid) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createPackage({
        ...formData,
        dateArrived,
        checkedInById,
      });
      resetForm();
      await onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      open={true}
      title="Add New Package"
      size="md"
      onClose={handleClose}
      onSubmit={handleSubmit}
      saving={isSubmitting}
      saveLabel="Add Package"
      submitDisabled={!isValid}
    >
      {/* Recipient — typeahead filter */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Recipient <Required />
        </label>
        {selectedRecipient ? (
          <div className="flex items-center justify-between rounded-lg border border-byu-royal bg-byu-royal/5 px-3 py-2 text-sm text-byu-navy">
            <span>
              {selectedRecipient.fullName}{' '}
              <span className="text-gray-400">({selectedRecipient.netId})</span>
            </span>
            <button
              type="button"
              onClick={() => {
                handleChange('recipientId', undefined);
                setRecipientSearch('');
              }}
              className="text-gray-400 hover:text-gray-600 text-xs ml-2"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search by name or Net ID…"
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
              className={inputClass}
              disabled={isSubmitting}
            />
            {recipientSearch && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                {filteredRecipients.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">No results</p>
                ) : (
                  filteredRecipients.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-byu-navy hover:bg-byu-royal/10 text-left"
                      onClick={() => {
                        handleChange('recipientId', r.id);
                        setRecipientSearch('');
                      }}
                    >
                      <span className="font-medium">{r.fullName}</span>
                      <span className="text-gray-400 text-xs">{r.netId}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Carrier */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Carrier <Required />
        </label>
        <select
          value={formData.carrierId ?? ''}
          onChange={(e) => handleChange('carrierId', e.target.value)}
          className={inputClass}
          disabled={isSubmitting}
        >
          <option value="">Select a carrier</option>
          {carriers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Sender */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Sender <Required />
        </label>
        <select
          value={formData.senderId ?? ''}
          onChange={(e) => handleChange('senderId', e.target.value)}
          className={inputClass}
          disabled={isSubmitting}
        >
          <option value="">Select a sender</option>
          {senders.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Date Arrived */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Date Arrived <Required />
        </label>
        <input
          type="date"
          value={dateArrived}
          onChange={(e) => setDateArrived(e.target.value)}
          className={inputClass}
          disabled={isSubmitting}
        />
      </div>

      {/* Logged By — TODO: replace with auth session in production */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Logged By <Required />
        </label>
        <select
          value={checkedInById}
          onChange={(e) => setCheckedInById(e.target.value)}
          className={inputClass}
          disabled={isSubmitting}
        >
          <option value="">Select a secretary</option>
          {secretaries.map((s) => (
            <option key={s.id} value={s.id}>{s.fullName}</option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Internal Notes
        </label>
        <textarea
          value={formData.notes ?? ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any internal notes about this package…"
          rows={3}
          className={`${inputClass} resize-y`}
          disabled={isSubmitting}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </BaseModal>
  );
}

// ─── Shared within file ───────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-byu-navy focus:outline-none focus:ring-2 focus:ring-byu-royal focus:border-transparent disabled:opacity-50 disabled:bg-gray-50';

function Required() {
  return <span className="text-red-500 ml-0.5">*</span>;
}