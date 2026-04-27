'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { DropdownEntity } from '@/types/dropdown';
import { createPackage } from '@/lib/api/packages';
import { fetchUsers } from '@/lib/api/users';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import FormModal, { type FormModalField } from '@/components/ui/modals/FormModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import Typeahead from '@/components/ui/forms/Typeahead';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddPackageModalProps {
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

type AddPackageFormValues = {
  carrierId: string;
  senderId: string;
  dateArrived: string;
  notes: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0];
}

const initialValues: AddPackageFormValues = {
  carrierId: '',
  senderId: '',
  dateArrived: todayString(),
  notes: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddPackageModal({ onClose, onSuccess }: AddPackageModalProps) {
  const { user } = useAuth();

  // Recipient lives outside FormModal's `values` because Typeahead binds to a User object,
  // not a string. The CustomField below renders Typeahead and closes over this state.
  const [recipient, setRecipient] = useState<User | null>(null);
  const [values, setValues] = useState<AddPackageFormValues>(initialValues);

  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [senders, setSenders] = useState<DropdownEntity[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCarriers(true).then(setCarriers).catch(console.error);
    fetchSenders(true).then(setSenders).catch(console.error);
  }, []);

  const resetForm = () => {
    setRecipient(null);
    setValues(initialValues);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = !!recipient && !!values.carrierId && !!values.senderId && !!user?.id;

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!user?.id) {
      setError('You must be signed in to add a package.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createPackage({
        recipientId: recipient!.id,
        carrierId: values.carrierId,
        senderId: values.senderId,
        notes: values.notes || undefined,
        dateArrived: values.dateArrived,
        checkedInById: user.id,
      });
      resetForm();
      await onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
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
        <FieldWrapper label="Recipient" required>
          <Typeahead
            value={recipient}
            onChange={setRecipient}
            fetchItems={async (query) => {
              const res = await fetchUsers({ search: query, pageSize: 10 });
              return res.data;
            }}
            getLabel={(u) => `${u.fullName} (${u.netId})`}
            getKey={(u) => u.id}
            placeholder="Search by name or Net ID..."
            disabled={isSubmitting}
          />
        </FieldWrapper>
      ),
    },
    {
      kind: 'select',
      key: 'carrierId',
      label: 'Carrier',
      required: true,
      options: carriers
        .filter((c) => c.isActive)
        .map((c) => ({ label: c.name, value: c.id })),
      placeholder: 'Select a carrier',
    },
    {
      kind: 'select',
      key: 'senderId',
      label: 'Sender',
      required: true,
      options: senders
        .filter((s) => s.isActive)
        .map((s) => ({ label: s.name, value: s.id })),
      placeholder: 'Select a sender',
    },
    {
      key: 'dateArrived',
      label: 'Date Arrived',
      type: 'date',
      required: true,
    },
    {
      kind: 'custom',
      key: 'checkedInBanner',
      colSpan: 2,
      render: () => (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
          <p className="text-gray-500">
            Checking in package as{' '}
            <span className="font-medium text-byu-navy">{user?.fullName ?? 'Unknown'}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'notes',
      label: 'Internal Notes',
      type: 'textarea',
      placeholder: 'Any internal notes about this package…',
      colSpan: 2,
    },
    ...(error
      ? [
          {
            kind: 'custom' as const,
            key: 'errorBanner',
            colSpan: 2 as const,
            render: () => <p className="text-sm text-red-600">{error}</p>,
          },
        ]
      : []),
  ];

  return (
    <FormModal<AddPackageFormValues>
      open={true}
      title="Add New Package"
      size="md"
      onClose={handleClose}
      onSubmit={handleSubmit}
      saving={isSubmitting}
      saveLabel="Add Package"
      submitDisabled={!isValid}
      values={values}
      setValues={setValues}
      fields={fields}
    />
  );
}
