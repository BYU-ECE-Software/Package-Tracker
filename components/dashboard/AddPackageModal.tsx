'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { CreatePackageRequest } from '@/types/package';
import type { DropdownEntity } from '@/types/dropdown';
import { createPackage } from '@/lib/api/packages';
import { fetchUsers } from '@/lib/api/users';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import BaseModal from '@/components/ui/modals/BaseModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import SelectField from '@/components/ui/forms/SelectField';
import TextLikeField from '@/components/ui/forms/TextLikeField';
import Typeahead from '@/components/ui/forms/Typeahead';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddPackageModalProps {
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddPackageModal({
  onClose,
  onSuccess,
}: AddPackageModalProps) {
  const { user } = useAuth();

  const [recipient, setRecipient] = useState<User | null>(null);
  const [carrierId, setCarrierId] = useState('');
  const [senderId, setSenderId] = useState('');
  const [notes, setNotes] = useState('');
  const [dateArrived, setDateArrived] = useState(todayString());

  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [senders, setSenders] = useState<DropdownEntity[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [carriersData, sendersData] = await Promise.all([
          fetchCarriers(true),
          fetchSenders(true),
        ]);
        setCarriers(carriersData);
        setSenders(sendersData);
      } catch {
        console.error('Failed to load carriers/senders');
      }
    };
    loadDropdowns();
  }, []);

  const resetForm = () => {
    setRecipient(null);
    setCarrierId('');
    setSenderId('');
    setNotes('');
    setDateArrived(todayString());
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = !!recipient && !!carrierId && !!senderId && !!user?.id;

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
        carrierId,
        senderId,
        notes: notes || undefined,
        dateArrived,
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
      <fieldset disabled={isSubmitting} className="space-y-4 border-0 p-0 m-0 min-w-0">
      {/* Recipient */}
      <FieldWrapper label="Recipient" required>
        <Typeahead
          value={recipient}
          onChange={setRecipient}
          fetchItems={async (query) => {
            const res = await fetchUsers({ search: query, pageSize: 10 });
            return res.data;
          }}
          getLabel={(user) => `${user.fullName} (${user.netId})`}
          getKey={(user) => user.id}
          placeholder="Search by name or Net ID..."
        />
      </FieldWrapper>

      {/* Carrier */}
      <FieldWrapper label="Carrier" required>
        <SelectField
          value={carrierId}
          onChange={setCarrierId}
          options={carriers
            .filter((c) => c.isActive)
            .map((c) => ({ label: c.name, value: c.id }))}
          placeholder="Select a carrier"
        />
      </FieldWrapper>

      {/* Sender */}
      <FieldWrapper label="Sender" required>
        <SelectField
          value={senderId}
          onChange={setSenderId}
          options={senders
            .filter((s) => s.isActive)
            .map((s) => ({ label: s.name, value: s.id }))}
          placeholder="Select a sender"
        />
      </FieldWrapper>

      {/* Date Arrived */}
      <FieldWrapper label="Date Arrived" required>
        <input
          type="date"
          value={dateArrived}
          onChange={(e) => setDateArrived(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-byu-navy focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
        />
      </FieldWrapper>

      {/* Checked in by (logged-in user) */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
        <p className="text-gray-500">
          Checking in package as{' '}
          <span className="font-medium text-byu-navy">
            {user?.fullName ?? 'Unknown'}
          </span>
        </p>
      </div>

      {/* Notes */}
      <FieldWrapper label="Internal Notes">
        <TextLikeField
          value={notes}
          onChange={setNotes}
          placeholder="Any internal notes about this package…"
          rows={3}
        />
      </FieldWrapper>

      {error && <p className="text-sm text-red-600">{error}</p>}
      </fieldset>
    </BaseModal>
  );
}