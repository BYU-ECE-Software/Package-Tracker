'use client';

import { useState, useEffect } from 'react';
import type { Package } from '@/types/package';
import type { DropdownEntity } from '@/types/dropdown';
import { updatePackage } from '@/lib/api/packages';
import { fetchCarriers, createCarrier } from '@/lib/api/carriers';
import { fetchSenders, createSender } from '@/lib/api/senders';
import { useToast } from '@/hooks/useToast';
import FormModal, { type FormModalField } from '@/components/ui/modals/FormModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import Combobox, { type ComboboxValue } from '@/components/ui/forms/Combobox';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditPackageModalProps {
  onClose: () => void;
  pkg: Package;
  onSuccess: () => Promise<void>;
}

type EditPackageFormValues = {
  notes: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditPackageModal({ onClose, pkg, onSuccess }: EditPackageModalProps) {
  const { showToast, ToastContainer } = useToast({ position: 'bottom-right' });

  const [values, setValues] = useState<EditPackageFormValues>({
    notes: pkg.notes ?? '',
  });

  const [carrier, setCarrier] = useState<ComboboxValue>({
    id: pkg.carrierId ?? '',
    name: pkg.carrier?.name ?? '',
  });
  const [sender, setSender] = useState<ComboboxValue>({
    id: pkg.senderId ?? '',
    name: pkg.sender?.name ?? '',
  });

  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [senders, setSenders] = useState<DropdownEntity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch all (including hidden) so a typed name can match a hidden entry
    // and reuse it instead of creating a duplicate.
    fetchCarriers().then(setCarriers).catch(console.error);
    fetchSenders().then(setSenders).catch(console.error);
  }, []);

  // Re-sync whenever pkg changes (parent may pass a different package)
  useEffect(() => {
    setValues({ notes: pkg.notes ?? '' });
    setCarrier({ id: pkg.carrierId ?? '', name: pkg.carrier?.name ?? '' });
    setSender({ id: pkg.senderId ?? '', name: pkg.sender?.name ?? '' });
  }, [pkg]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Resolve carrier/sender. If the user typed a name matching an existing
      // entry (including a hidden one), reuse that id. Otherwise create new.
      const carrierName = carrier.name.trim();
      const existingCarrier = carriers.find(
        (c) => c.name.toLowerCase() === carrierName.toLowerCase(),
      );
      const carrierId = carrierName
        ? carrier.id ||
          existingCarrier?.id ||
          (await createCarrier({ name: carrierName, hidden: false })).id
        : undefined;

      const senderName = sender.name.trim();
      const existingSender = senders.find(
        (s) => s.name.toLowerCase() === senderName.toLowerCase(),
      );
      const senderId = senderName
        ? sender.id ||
          existingSender?.id ||
          (await createSender({ name: senderName, hidden: false })).id
        : undefined;

      await updatePackage(pkg.id, {
        carrierId,
        senderId,
        notes: values.notes || undefined,
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
      kind: 'custom',
      key: 'carrier',
      render: () => (
        <FieldWrapper label="Carrier" required>
          <Combobox
            items={carriers.filter((c) => !c.hidden)}
            value={carrier}
            onChange={setCarrier}
            placeholder="Select or type a new carrier…"
            disabled={isSubmitting}
          />
        </FieldWrapper>
      ),
    },
    {
      kind: 'custom',
      key: 'sender',
      render: () => (
        <FieldWrapper label="Sender" required>
          <Combobox
            items={senders.filter((s) => !s.hidden)}
            value={sender}
            onChange={setSender}
            placeholder="Select or type a new sender…"
            disabled={isSubmitting}
          />
        </FieldWrapper>
      ),
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
