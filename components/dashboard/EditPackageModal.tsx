'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { Package, UpdatePackageRequest } from '@/types/package';
import type { DropdownEntity } from '@/types/dropdown';
import { updatePackage } from '@/lib/api/packages';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import BaseModal from '@/components/ui/modals/BaseModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import SelectField from '@/components/ui/forms/SelectField';
import TextLikeField from '@/components/ui/forms/TextLikeField';

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
  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [senders, setSenders] = useState<DropdownEntity[]>([]);
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
      <FieldWrapper label="Recipient">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
          {pkg.recipient?.fullName ?? '—'}{' '}
          <span className="text-gray-400">({pkg.recipient?.netId ?? '—'})</span>
        </div>
      </FieldWrapper>

      {/* Carrier */}
      <FieldWrapper label="Carrier">
        <SelectField
          value={formData.carrierId ?? ''}
          onChange={(val) => handleChange('carrierId', val || undefined)}
          options={carriers.map((c) => ({ label: c.name, value: c.id }))}
          placeholder="Select carrier"
        />
      </FieldWrapper>

      {/* Sender */}
      <FieldWrapper label="Sender">
        <SelectField
          value={formData.senderId ?? ''}
          onChange={(val) => handleChange('senderId', val || undefined)}
          options={senders.map((s) => ({ label: s.name, value: s.id }))}
          placeholder="Select sender"
        />
      </FieldWrapper>

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
      <FieldWrapper label="Internal Notes">
        <TextLikeField
          as="textarea"
          value={formData.notes ?? ''}
          onChange={(val) => handleChange('notes', val || undefined)}
          placeholder="Any internal notes about this package…"
          rows={3}
        />
      </FieldWrapper>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </BaseModal>
  );
}