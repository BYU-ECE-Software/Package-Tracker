'use client';

import { useState } from 'react';
import type { Package } from '@/types/package';
import type { User } from '@/types/user';
import { checkOutPackage, updatePackage } from '@/lib/api/packages';
import BaseModal from '@/components/ui/BaseModal';
import type { StepConfig } from '@/components/ui/BaseModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckoutMethod = 'pickup' | 'office' | null;

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package;
  secretaries: User[];
  onSuccess: () => Promise<void>;
  // TODO: replace checkedOutById dropdown with auth session once auth is wired up
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckOutModal({
  isOpen,
  onClose,
  pkg,
  secretaries,
  onSuccess,
}: CheckOutModalProps) {
  const [method, setMethod] = useState<CheckoutMethod>(null);
  const [pickedUpById, setPickedUpById] = useState(pkg.recipient?.id ?? '');
  const [datePickedUp, setDatePickedUp] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [checkedOutById, setCheckedOutById] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setMethod(null);
    setPickedUpById(pkg.recipient?.id ?? '');
    setDatePickedUp(new Date().toISOString().split('T')[0]);
    setCheckedOutById('');
    setError(null);
    onClose();
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (method === 'office') {
        await updatePackage(pkg.id, {
          deliveredToOffice: true,
          checkedOutById,
          datePickedUp,
        });
      } else {
        await checkOutPackage(pkg.id, checkedOutById);
      }
      await onSuccess();
      handleClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const step2CanAdvance =
    !!checkedOutById && (method === 'office' || !!pickedUpById);

  const steps: StepConfig[] = [
    {
      title: 'How is this package leaving?',
      canAdvance: method !== null,
      content: (
        <Step1MethodSelect method={method} onSelect={setMethod} pkg={pkg} />
      ),
    },
    {
      title:
        method === 'office' ? 'Confirm office delivery' : 'Confirm pickup details',
      canAdvance: step2CanAdvance,
      content: (
        <Step2Details
          method={method}
          pkg={pkg}
          secretaries={secretaries}
          pickedUpById={pickedUpById}
          setPickedUpById={setPickedUpById}
          datePickedUp={datePickedUp}
          setDatePickedUp={setDatePickedUp}
          checkedOutById={checkedOutById}
          setCheckedOutById={setCheckedOutById}
          error={error}
        />
      ),
    },
  ];

  return (
    <BaseModal
      open={isOpen}
      title="Check Out Package"
      size="sm"
      onClose={handleClose}
      steps={steps}
      onComplete={handleComplete}
      completingLabel="Check Out"
      completing={isSubmitting}
    />
  );
}

// ─── Step 1 — method selection ────────────────────────────────────────────────

function Step1MethodSelect({
  method,
  onSelect,
  pkg,
}: {
  method: CheckoutMethod;
  onSelect: (m: CheckoutMethod) => void;
  pkg: Package;
}) {
  return (
    <div className="space-y-3 py-2">
      <p className="text-sm text-gray-500">
        Package for{' '}
        <span className="font-medium text-byu-navy">
          {pkg.recipient?.fullName ?? 'Unknown'}
        </span>{' '}
        ({pkg.recipient?.netId ?? '—'})
      </p>

      <button
        type="button"
        onClick={() => onSelect('pickup')}
        className={methodButtonClass(method === 'pickup')}
      >
        <span className="text-2xl">🧍</span>
        <div className="text-left">
          <p className="font-medium text-sm">Picked Up</p>
          <p className="text-xs text-gray-500">Recipient or someone else collected it</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect('office')}
        className={methodButtonClass(method === 'office')}
      >
        <span className="text-2xl">🚪</span>
        <div className="text-left">
          <p className="font-medium text-sm">Delivered to Office</p>
          <p className="text-xs text-gray-500">Package was brought to a professor&apos;s office</p>
        </div>
      </button>
    </div>
  );
}

function methodButtonClass(active: boolean) {
  return [
    'flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-byu-navy transition',
    active
      ? 'border-byu-royal bg-byu-royal/5'
      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
  ].join(' ');
}

// ─── Step 2 — details ─────────────────────────────────────────────────────────

function Step2Details({
  method,
  pkg,
  secretaries,
  pickedUpById,
  setPickedUpById,
  datePickedUp,
  setDatePickedUp,
  checkedOutById,
  setCheckedOutById,
  error,
}: {
  method: CheckoutMethod;
  pkg: Package;
  secretaries: User[];
  pickedUpById: string;
  setPickedUpById: (v: string) => void;
  datePickedUp: string;
  setDatePickedUp: (v: string) => void;
  checkedOutById: string;
  setCheckedOutById: (v: string) => void;
  error: string | null;
}) {
  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-byu-navy focus:outline-none focus:ring-2 focus:ring-byu-royal focus:border-transparent';

  return (
    <div className="space-y-4 py-2">
      {/* Package summary */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm space-y-1">
        <p className="text-gray-500">
          Recipient:{' '}
          <span className="font-medium text-byu-navy">
            {pkg.recipient?.fullName ?? '—'}
          </span>
        </p>
        {pkg.carrier && (
          <p className="text-gray-500">
            Carrier: <span className="font-medium text-byu-navy">{pkg.carrier.name}</span>
          </p>
        )}
      </div>

      {/* Pickup-specific: who collected it */}
      {method === 'pickup' && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-byu-navy">
            Picked Up By <span className="text-red-500">*</span>
          </label>
          <select
            value={pickedUpById}
            onChange={(e) => setPickedUpById(e.target.value)}
            className={inputClass}
          >
            <option value="">Select recipient</option>
            {pkg.recipient && (
              <option value={pkg.recipient.id}>
                {pkg.recipient.fullName} — Expected Recipient
              </option>
            )}
            <option disabled>──────────</option>
            <option value="other">Someone else</option>
          </select>
        </div>
      )}

      {/* Office delivery confirmation */}
      {method === 'office' && (
        <p className="text-sm text-gray-600 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          This package will be marked as delivered to office.
        </p>
      )}

      {/* Date */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={datePickedUp}
          onChange={(e) => setDatePickedUp(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Secretary — TODO: replace with auth session in production */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-byu-navy">
          Checked Out By <span className="text-red-500">*</span>
        </label>
        <select
          value={checkedOutById}
          onChange={(e) => setCheckedOutById(e.target.value)}
          className={inputClass}
        >
          <option value="">Select a secretary</option>
          {secretaries.map((s) => (
            <option key={s.id} value={s.id}>{s.fullName}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}