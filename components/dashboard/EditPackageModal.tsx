'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { Package, UpdatePackageRequest } from '@/types/package';
import type { Carrier } from '@/types/carrier';
import type { Sender } from '@/types/sender';
import { updatePackage } from '@/lib/api/packages';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import BaseModal from '@/components/ui/modals/BaseModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditPackageModalProps {
  onClose: () => void;
  pkg: Package;
  recipients: User[];
  secretaries: User[];
  onSuccess: () => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditPackageModal({
  onClose,
  pkg,
  onSuccess,
}: EditPackageModalProps) {
  const [formData, setFormData] = useState<UpdatePackageRequest>({});
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCarriers(true).then(setCarriers).catch(console.error);
    fetchSenders(true).then(setSenders).catch(console.error);
  }, []);

  useEffect(() => {
    setFormData({
      carrierId: pkg.carrierId ?? undefined,
      senderId: pkg.senderId ?? undefined,
      notes: pkg.notes ?? undefined,
      notificationSent: pkg.notificationSent,
    });
  }, [pkg]);

  const handleChange = <K extends keyof UpdatePackageRequest>(
    field: K,
    value: UpdatePackageRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updatePackage(pkg.id, formData);
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
      title="Edit Package"
      size="md"
      onClose={handleClose}
      onSubmit={handleSubmit}
      saving={isSubmitting}
      saveLabel="Save Changes"
    >
      {/* Recipient — read-only, shown for context */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">Recipient</label>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
          {pkg.recipient?.fullName ?? '—'}{' '}
          <span className="text-gray-400">({pkg.recipient?.netId ?? '—'})</span>
        </div>
      </div>

      {/* Carrier */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">Carrier</label>
        <select
          value={formData.carrierId ?? ''}
          onChange={(e) =>
            handleChange('carrierId', e.target.value || undefined)
          }
          className={inputClass}
          disabled={isSubmitting}
        >
          <option value="">Select carrier</option>
          {carriers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Sender */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">Sender</label>
        <select
          value={formData.senderId ?? ''}
          onChange={(e) =>
            handleChange('senderId', e.target.value || undefined)
          }
          className={inputClass}
          disabled={isSubmitting}
        >
          <option value="">Select sender</option>
          {senders.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Recipient Notified */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
        <label className="text-sm font-medium text-byu-navy">
          Recipient Notified
        </label>
        <input
          type="checkbox"
          checked={formData.notificationSent ?? false}
          onChange={(e) => handleChange('notificationSent', e.target.checked)}
          className="h-4 w-4 text-byu-royal rounded"
          disabled={isSubmitting}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Internal Notes
        </label>
        <textarea
          value={formData.notes ?? ''}
          onChange={(e) =>
            handleChange('notes', e.target.value || undefined)
          }
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