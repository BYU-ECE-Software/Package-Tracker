'use client';

import { useState } from 'react';
import { FiUser, FiHome } from 'react-icons/fi';
import type { Package } from '@/types/package';
import type { User } from '@/types/user';
import { updatePackage } from '@/lib/api/packages';
import { fetchUsers } from '@/lib/api/users';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import { useToast } from '@/hooks/useToast';
import StepModal, { type StepConfig } from '@/components/ui/modals/StepModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import FormGrid from '@/components/ui/forms/FormGrid';
import TextLikeField from '@/components/ui/forms/TextLikeField';
import Typeahead from '@/components/ui/forms/Typeahead';

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckoutMethod = 'pickup' | 'office' | null;

interface CheckOutModalProps {
  onClose: () => void;
  pkg: Package;
  onSuccess: () => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckOutModal({
  onClose,
  pkg,
  onSuccess,
}: CheckOutModalProps) {
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast({ position: 'bottom-right' });

  const [method, setMethod] = useState<CheckoutMethod>(null);
  const [pickedUpBy, setPickedUpBy] = useState<User | null>(null);
  const [datePickedUp, setDatePickedUp] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setMethod(null);
    setPickedUpBy(null);
    setDatePickedUp(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const handleComplete = async () => {
    if (!user?.id) {
      showToast({
        type: 'error',
        title: 'Not signed in',
        message: 'You must be signed in to check out a package.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (method === 'office') {
        await updatePackage(pkg.id, {
          deliveredToOffice: true,
          checkedOutById: user.id,
          datePickedUp,
        });
      } else {
        await updatePackage(pkg.id, {
          deliveredToOffice: false,
          checkedOutById: user.id,
          pickedUpByUserId: pickedUpBy?.id,
          datePickedUp,
        });
      }
      await onSuccess();
      handleClose();
    } catch {
      showToast({
        type: 'error',
        title: 'Check out failed',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const step2CanAdvance = method === 'office' || !!pickedUpBy;

  const steps: StepConfig[] = [
    {
      title: 'How is this package leaving?',
      canAdvance: method !== null,
      content: ({ goNext }) => (
        <Step1MethodSelect
          method={method}
          onSelect={(m) => {
            setMethod(m);
            if (m !== null) goNext();
          }}
          pkg={pkg}
        />
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
          pickedUpBy={pickedUpBy}
          setPickedUpBy={setPickedUpBy}
          datePickedUp={datePickedUp}
          setDatePickedUp={setDatePickedUp}
          checkedOutBy={user}
        />
      ),
    },
  ];

  return (
    <>
      <StepModal
        open={true}
        title="Check Out Package"
        size="md"
        onClose={handleClose}
        steps={steps}
        onComplete={handleComplete}
        completingLabel="Check Out"
        completing={isSubmitting}
      />
      <ToastContainer />
    </>
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
    <div className="space-y-4">
      {/* Package details at the top */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm space-y-1">
        <p className="text-gray-500">
          Recipient:{' '}
          <span className="font-medium text-byu-navy">
            {pkg.recipient?.fullName ?? '—'}
          </span>
          {' '}
          <span className="text-gray-400">({pkg.recipient?.netId ?? '—'})</span>
        </p>
        {pkg.carrier && (
          <p className="text-gray-500">
            Carrier: <span className="font-medium text-byu-navy">{pkg.carrier.name}</span>
          </p>
        )}
        {pkg.sender && (
          <p className="text-gray-500">
            Sender: <span className="font-medium text-byu-navy">{pkg.sender.name}</span>
          </p>
        )}
      </div>

      {/* Method selection buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onSelect('pickup')}
          className={methodButtonClass(method === 'pickup')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-byu-navy/10">
            <FiUser className="h-5 w-5 text-byu-navy" />
          </div>
          <div className="text-left flex-1">
            <p className="font-medium text-sm">Picked Up</p>
            <p className="text-xs text-gray-500">Recipient or someone else collected it</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('office')}
          className={methodButtonClass(method === 'office')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-byu-navy/10">
            <FiHome className="h-5 w-5 text-byu-navy" />
          </div>
          <div className="text-left flex-1">
            <p className="font-medium text-sm">Delivered to Office</p>
            <p className="text-xs text-gray-500">Package was brought to a professor&apos;s office</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function methodButtonClass(active: boolean) {
  return [
    'flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-byu-navy transition cursor-pointer',
    active
      ? 'border-byu-royal bg-byu-royal/5'
      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
  ].join(' ');
}

// ─── Step 2 — details ─────────────────────────────────────────────────────────

function Step2Details({
  method,
  pkg,
  pickedUpBy,
  setPickedUpBy,
  datePickedUp,
  setDatePickedUp,
  checkedOutBy,
}: {
  method: CheckoutMethod;
  pkg: Package;
  pickedUpBy: User | null;
  setPickedUpBy: (user: User | null) => void;
  datePickedUp: string;
  setDatePickedUp: (v: string) => void;
  checkedOutBy: User | null;
}) {
  return (
    <FormGrid>
      {/* Pickup-specific: who collected it - full width */}
      {method === 'pickup' && (
        <FieldWrapper className="md:col-span-2" label="Picked Up By" required>
          <Typeahead
            value={pickedUpBy}
            onChange={setPickedUpBy}
            fetchItems={async (query) => {
              const res = await fetchUsers({ search: query, pageSize: 10 });
              return res.data;
            }}
            getLabel={(user) => `${user.fullName} (${user.netId})`}
            getKey={(user) => user.id}
            suggestedItem={pkg.recipient}
            suggestedLabel="Expected recipient:"
            placeholder="Search for who picked it up..."
          />
        </FieldWrapper>
      )}

      {/* Date - full width */}
      <FieldWrapper className="md:col-span-2" label="Date" required>
        <TextLikeField
          type="date"
          value={datePickedUp}
          onChange={setDatePickedUp}
        />
      </FieldWrapper>

      {/* Logged in as - full width */}
      <div className="md:col-span-2 mt-2">
        <p className="text-xs text-gray-600">
          Logged in as <span className="font-semibold">{checkedOutBy?.fullName ?? 'Unknown'}</span>
        </p>
      </div>
    </FormGrid>
  );
}