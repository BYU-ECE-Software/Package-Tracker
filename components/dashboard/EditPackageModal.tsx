'use client';

import { useState, useEffect } from 'react';
import type { Package } from '@/types/package';
import type { DropdownEntity } from '@/types/dropdown';
import { updatePackage } from '@/lib/api/packages';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import { useToast } from '@/hooks/useToast';
import FormModal, { type FormModalField } from '@/components/ui/modals/FormModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditPackageModalProps {
  onClose: () => void;
  pkg: Package;
  onSuccess: () => Promise<void>;
}

type EditPackageFormValues = {
  carrierId: string;
  senderId: string;
  notes: string;
  notificationSent: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditPackageModal({ onClose, pkg, onSuccess }: EditPackageModalProps) {
  const { showToast, ToastContainer } = useToast({ position: 'bottom-right' });

  const [values, setValues] = useState<EditPackageFormValues>({
    carrierId: pkg.carrierId ?? '',
    senderId: pkg.senderId ?? '',
    notes: pkg.notes ?? '',
    notificationSent: pkg.notificationSent ?? false,
  });

  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [senders, setSenders] = useState<DropdownEntity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCarriers(true).then(setCarriers).catch(console.error);
    fetchSenders(true).then(setSenders).catch(console.error);
  }, []);

  // Re-sync values whenever pkg changes (parent may pass a different package)
  useEffect(() => {
    setValues({
      carrierId: pkg.carrierId ?? '',
      senderId: pkg.senderId ?? '',
      notes: pkg.notes ?? '',
      notificationSent: pkg.notificationSent ?? false,
    });
  }, [pkg]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updatePackage(pkg.id, {
        carrierId: values.carrierId || undefined,
        senderId: values.senderId || undefined,
        notes: values.notes || undefined,
        notificationSent: values.notificationSent,
      });
      await onSuccess();
    } catch {
      showToast({
        type: 'error',
        title: 'Save failed',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FormModalField[] = [
    {
      kind: 'custom',
      key: 'recipient',
      colSpan: 2,
      render: () => (
        <FieldWrapper label="Recipient">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            {pkg.recipient?.fullName ?? '—'}{' '}
            <span className="text-gray-400">({pkg.recipient?.netId ?? '—'})</span>
          </div>
        </FieldWrapper>
      ),
    },
    {
      kind: 'select',
      key: 'carrierId',
      label: 'Carrier',
      options: carriers.map((c) => ({ label: c.name, value: c.id })),
      placeholder: 'Select carrier',
    },
    {
      kind: 'select',
      key: 'senderId',
      label: 'Sender',
      options: senders.map((s) => ({ label: s.name, value: s.id })),
      placeholder: 'Select sender',
    },
    {
      kind: 'checkbox',
      key: 'notificationSent',
      label: 'Recipient Notified',
      colSpan: 2,
    },
    {
      key: 'notes',
      label: 'Internal Notes',
      type: 'textarea',
      placeholder: 'Any internal notes about this package…',
      colSpan: 2,
    },
  ];

  return (
    <>
      <FormModal<EditPackageFormValues>
        open={true}
        title="Edit Package"
        size="md"
        onClose={onClose}
        onSubmit={handleSubmit}
        saving={isSubmitting}
        saveLabel="Save Changes"
        values={values}
        setValues={setValues}
        fields={fields}
      />
      <ToastContainer />
    </>
  );
}
