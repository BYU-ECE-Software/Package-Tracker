'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types/user';
import type { DropdownEntity } from '@/types/dropdown';
import { createPackage } from '@/lib/api/packages';
import { fetchUsers } from '@/lib/api/users';
import { fetchCarriers } from '@/lib/api/carriers';
import { fetchSenders } from '@/lib/api/senders';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import { useToast } from '@/hooks/useToast'; // Correct hook import
import StepModal, { type StepConfig } from '@/components/ui/modals/StepModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import Typeahead from '@/components/ui/forms/Typeahead';
import FormGrid from '@/components/ui/forms/FormGrid';
import CheckboxField from '@/components/ui/forms/CheckboxField';
import TextLikeField from '@/components/ui/forms/TextLikeField';
import SelectField from '@/components/ui/forms/SelectField';

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
  
  const [packageData, setPackageData] = useState({
    carrierId: '',
    senderId: '',
    dateArrived: new Date().toISOString().split('T')[0],
    notes: '',
    sendEmail: true,
  });

  const [emailData, setEmailData] = useState({
    subject: 'Package Arrival Notification',
    body: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCarriers(true).then(setCarriers).catch(console.error);
    fetchSenders(true).then(setSenders).catch(console.error);
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
      await createPackage({
        recipientId: recipient.id,
        carrierId: packageData.carrierId,
        senderId: packageData.senderId,
        notes: packageData.notes || undefined,
        dateArrived: packageData.dateArrived,
        checkedInById: user.id,
        notificationSent: packageData.sendEmail,
        emailOptions: packageData.sendEmail ? emailData : undefined,
      });
      
      // Success Toast
      showToast({ 
        type: 'success', 
        title: 'Success', 
        message: 'Package added successfully.' 
      });

      await onSuccess();
      onClose();
    } catch {
      // Error Toast appears on the screen you clicked "Submit" on
      showToast({ 
        type: 'error', 
        title: 'Submission Failed', 
        message: 'Could not add package. Please check your SMTP settings or connection.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: StepConfig[] = [
    {
      title: 'Enter package details',
      canAdvance: !!recipient && !!packageData.carrierId && !!packageData.senderId,
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
            <SelectField
              value={packageData.carrierId}
              placeholder="Select carrier"
              options={carriers
                .filter((c) => c.isActive)
                .map((c) => ({ label: c.name, value: c.id }))}
              onChange={(v: string) => setPackageData((p) => ({ ...p, carrierId: v }))}
            />
          </FieldWrapper>

          <FieldWrapper label="Sender" required>
            <SelectField
              value={packageData.senderId}
              placeholder="Select sender"
              options={senders
                .filter((s) => s.isActive)
                .map((s) => ({ label: s.name, value: s.id }))}
              onChange={(v: string) => setPackageData((p) => ({ ...p, senderId: v }))}
            />
          </FieldWrapper>

          <FieldWrapper label="Date Arrived" required>
            <TextLikeField
              type="date"
              value={packageData.dateArrived}
              onChange={(v: string) => setPackageData((p) => ({ ...p, dateArrived: v }))}
            />
          </FieldWrapper>

          {/* Fixed Alignment: Using FieldWrapper with an empty label matches the other field heights */}
          <FieldWrapper label=" ">
            <div className="flex items-center gap-3 pt-2">
              <CheckboxField
                checked={packageData.sendEmail}
                onChange={(checked: boolean) =>
                  setPackageData((p) => ({ ...p, sendEmail: checked }))
                }
              />
              <span className="text-sm font-medium text-gray-700">Send notification email?</span>
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

          <div className="md:col-span-2 mt-4 opacity-40">
             <p className="text-[10px] uppercase tracking-widest text-gray-500">
               Logged by <span className="font-bold">{user?.fullName ?? 'Unknown'}</span>
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