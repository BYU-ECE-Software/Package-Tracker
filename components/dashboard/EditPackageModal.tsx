'use client';

import { useState, useEffect } from 'react';
import type { Package } from '@/types/package';
import type { DropdownEntity } from '@/types/general/DropdownEntity';
import { updatePackage } from '@/lib/api/packages';
import { fetchCarriers, createCarrier } from '@/lib/api/carriers';
import { fetchVendors, createVendor } from '@/lib/api/vendors';
import { useToast } from '@/hooks/useToast';
import FormModal, { type FormModalField } from '@/components/general/forms/FormModal';
import FieldWrapper from '@/components/general/forms/FieldWrapper';
import Combobox, { type ComboboxValue } from '@/components/general/forms/Combobox';

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
  const [vendor, setVendor] = useState<ComboboxValue>({
    id: pkg.vendorId ?? '',
    name: pkg.vendor?.name ?? '',
  });

  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [vendors, setVendors] = useState<DropdownEntity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch all (including hidden) so a typed name can match a hidden entry
    // and reuse it instead of creating a duplicate.
    fetchCarriers().then(setCarriers).catch(console.error);
    fetchVendors().then(setVendors).catch(console.error);
  }, []);

  // Re-sync whenever pkg changes (parent may pass a different package)
  useEffect(() => {
    setValues({ notes: pkg.notes ?? '' });
    setCarrier({ id: pkg.carrierId ?? '', name: pkg.carrier?.name ?? '' });
    setVendor({ id: pkg.vendorId ?? '', name: pkg.vendor?.name ?? '' });
  }, [pkg]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Resolve carrier/vendor. If the user typed a name matching an existing
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

      const vendorName = vendor.name.trim();
      const existingVendor = vendors.find(
        (s) => s.name.toLowerCase() === vendorName.toLowerCase(),
      );
      const vendorId = vendorName
        ? vendor.id ||
          existingVendor?.id ||
          (await createVendor({ name: vendorName, hidden: false })).id
        : undefined;

      await updatePackage(pkg.id, {
        carrierId,
        vendorId,
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
      key: 'vendor',
      render: () => (
        <FieldWrapper label="Vendor" required>
          <Combobox
            items={vendors.filter((s) => !s.hidden)}
            value={vendor}
            onChange={setVendor}
            placeholder="Select or type a new vendor…"
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
