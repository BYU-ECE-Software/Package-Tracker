'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { DropdownEntity } from '@/types/dropdown';
import { createPackage, updatePackage } from '@/lib/api/packages';
import { fetchUsers } from '@/lib/api/users';
import { fetchCarriers, createCarrier } from '@/lib/api/carriers';
import { fetchSenders, createSender } from '@/lib/api/senders';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import { useToast } from '@/hooks/useToast'; // Correct hook import
import StepModal, { type StepConfig } from '@/components/ui/modals/StepModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import Typeahead from '@/components/ui/forms/Typeahead';
import FormGrid from '@/components/ui/forms/FormGrid';
import CheckboxField from '@/components/ui/forms/CheckboxField';
import TextLikeField from '@/components/ui/forms/TextLikeField';
import DropdownCombobox, { type DropdownComboboxValue } from './DropdownCombobox';

export default function AddPackageModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const { user } = useAuth();
  
  // Hook returns showToast and a Container to render
  const { showToast, ToastContainer } = useToast({ position: 'bottom-right' });
  
  const [recipient, setRecipient] = useState<User | null>(null);
  const [carriers, setCarriers] = useState<DropdownEntity[]>([]);
  const [senders, setSenders] = useState<DropdownEntity[]>([]);
  
  const [carrier, setCarrier] = useState<DropdownComboboxValue>({ id: '', name: '' });
  const [sender, setSender] = useState<DropdownComboboxValue>({ id: '', name: '' });

  const [packageData, setPackageData] = useState({
    dateArrived: new Date().toISOString().split('T')[0],
    notes: '',
    sendEmail: true,
    deliverToOffice: false,
  });

  const [emailData, setEmailData] = useState({
    subject: 'Package Arrival Notification',
    body: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch ALL carriers/senders (including hidden) so we can match a typed
    // name against hidden entries and reuse them instead of duplicating.
    fetchCarriers().then(setCarriers).catch(console.error);
    fetchSenders().then(setSenders).catch(console.error);
  }, []);

  useEffect(() => {
    if (recipient) {
      setEmailData((prev) => ({
        ...prev,
        body: `A package has arrived for you at the mailroom. Please come by to pick it up at your earliest convenience.`,
      }));
    }
  }, [recipient]);

  const handleComplete = async () => {
    if (!user?.id || !recipient) return;

    setIsSubmitting(true);

    try {
      // Resolve carrier/sender. If the user typed a name that matches an
      // existing entry (including a hidden one), reuse that id. Otherwise
      // create a new entry as visible.
      const carrierName = carrier.name.trim();
      const existingCarrier = carriers.find(
        (c) => c.name.toLowerCase() === carrierName.toLowerCase(),
      );
      const carrierId =
        carrier.id ||
        existingCarrier?.id ||
        (await createCarrier({ name: carrierName, hidden: false })).id;

      const senderName = sender.name.trim();
      const existingSender = senders.find(
        (s) => s.name.toLowerCase() === senderName.toLowerCase(),
      );
      const senderId =
        sender.id ||
        existingSender?.id ||
        (await createSender({ name: senderName, hidden: false })).id;

      const newPackage = await createPackage({
        recipientId: recipient.id,
        carrierId,
        senderId,
        notes: packageData.notes || undefined,
        dateArrived: packageData.dateArrived,
        checkedInById: user.id,
        notificationSent: packageData.sendEmail,
        emailOptions: packageData.sendEmail ? emailData : undefined,
      });

      // Auto-check-out as office delivery when requested.
      if (packageData.deliverToOffice) {
        await updatePackage(newPackage.id, {
          deliveredToOffice: true,
          checkedOutById: user.id,
          datePickedUp: packageData.dateArrived,
        });
      }
      
      // Success Toast
      showToast({ 
        type: 'success', 
        title: 'Success', 
        message: 'Package added successfully.' 
      });

      await onSuccess();
      onClose();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : String(err);
      const isEmailError = /mail|smtp|notification email/i.test(rawMessage);

      showToast({
        type: 'error',
        title: isEmailError ? 'Notification email failed' : 'Submission failed',
        message: isEmailError
          ? `${rawMessage}. Check your SMTP settings or connection.`
          : rawMessage || 'Could not add package. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: StepConfig[] = [
    {
      title: 'Enter package details',
      canAdvance: !!recipient && !!carrier.name.trim() && !!sender.name.trim(),
      content: (
        <FormGrid>
          <FieldWrapper label="Recipient" required className="md:col-span-2">
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

          <FieldWrapper label="Carrier" required>
            <DropdownCombobox
              items={carriers.filter((c) => !c.hidden)}
              value={carrier}
              onChange={setCarrier}
              placeholder="Select or type a new carrier…"
              disabled={isSubmitting}
            />
          </FieldWrapper>

          <FieldWrapper label="Sender" required>
            <DropdownCombobox
              items={senders.filter((s) => !s.hidden)}
              value={sender}
              onChange={setSender}
              placeholder="Select or type a new sender…"
              disabled={isSubmitting}
            />
          </FieldWrapper>

          <FieldWrapper label="Date Arrived" required>
            <TextLikeField
              type="date"
              value={packageData.dateArrived}
              onChange={(v: string) => setPackageData((p) => ({ ...p, dateArrived: v }))}
            />
          </FieldWrapper>

          <FieldWrapper label="">
            <div className="-mt-4 pl-4 space-y-2">
              <CheckboxField
                checked={packageData.sendEmail}
                onChange={(checked: boolean) =>
                  setPackageData((p) => ({ ...p, sendEmail: checked }))
                }
                label="Send notification email"
              />
              <CheckboxField
                checked={packageData.deliverToOffice}
                onChange={(checked: boolean) =>
                  setPackageData((p) => ({ ...p, deliverToOffice: checked }))
                }
                label="Deliver To Office"
              />
            </div>
          </FieldWrapper>

          <FieldWrapper label="Notes" className="md:col-span-2">
            <TextLikeField
              as="textarea"
              placeholder="Any additional notes about this package..."
              value={packageData.notes}
              onChange={(v: string) => setPackageData((p) => ({ ...p, notes: v }))}
            />
          </FieldWrapper>

          {/* Fixed: reduced gap (mt-4 → mt-2), darker text, better wording */}
          <div className="md:col-span-2">
             <p className="text-xs text-gray-600">
               Logged in as <span className="font-semibold">{user?.fullName ?? 'Unknown'}</span>
             </p>
          </div>
        </FormGrid>
      ),
    },
    ...(packageData.sendEmail
      ? [
          {
            title: 'Personalize notification',
            content: (
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
                  <p className="text-blue-800"><strong>To:</strong> {recipient?.email ?? '—'}</p>
                  <p className="text-blue-800"><strong>Subject:</strong> {emailData.subject}</p>
                </div>
                <FieldWrapper label="Email Body">
                  <TextLikeField
                    as="textarea"
                    rows={8}
                    value={emailData.body}
                    onChange={(v: string) => setEmailData((e) => ({ ...e, body: v }))}
                  />
                </FieldWrapper>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <StepModal
        open={true}
        title="Add New Package"
        size="md"
        onClose={onClose}
        steps={steps}
        onComplete={handleComplete}
        completing={isSubmitting}
        completingLabel={packageData.sendEmail ? 'Add & Send Notification' : 'Add Package'}
      />
      {/* Required for the toast to actually render on top of the modal */}
      <ToastContainer />
    </>
  );
}