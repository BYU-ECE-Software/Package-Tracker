'use client';

import { useState } from 'react';
import type { Package } from '@/types/package';
import { sendEmail } from '@/lib/api/email';
import { useToast } from '@/hooks/useToast';
import BaseModal from '@/components/ui/modals/BaseModal';
import FieldWrapper from '@/components/ui/forms/FieldWrapper';
import TextLikeField from '@/components/ui/forms/TextLikeField';

interface SendEmailModalProps {
  onClose: () => void;
  pkg: Package;
  onSuccess?: () => void;
  /** Override the default subject. Falls back to a generic reminder subject. */
  defaultSubject?: string;
  /** Override the default body. Falls back to a generic reminder body using the recipient's name. */
  defaultBody?: string;
  /** Title shown in the modal header. */
  title?: string;
  /** Label on the submit button. */
  saveLabel?: string;
}

function buildDefaultBody(name: string | undefined): string {
  return (
    `This is a friendly reminder that your package is still waiting for pickup at the ECE mailroom.\n\n` +
    `Please stop by at your earliest convenience.`
  );
}

export default function SendEmailModal({
  onClose,
  pkg,
  onSuccess,
  defaultSubject = 'Package Reminder',
  defaultBody,
  title = 'Send Follow-Up Email',
  saveLabel = 'Send Email',
}: SendEmailModalProps) {
  const { showToast, ToastContainer } = useToast({ position: 'bottom-right' });

  const [emailData, setEmailData] = useState({
    subject: defaultSubject,
    body: defaultBody ?? buildDefaultBody(pkg.recipient?.fullName),
  });

  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!pkg.recipient?.email) {
      showToast({
        type: 'error',
        title: 'No email on file',
        message: 'This recipient has no email address on file.',
      });
      return;
    }

    setIsSending(true);
    try {
      await sendEmail({
        to: pkg.recipient.email,
        subject: emailData.subject,
        body: emailData.body,
        recipientName: pkg.recipient.fullName,
        packageId: pkg.id,
        recipientId: pkg.recipientId,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : String(err);
      const isMailError = /mail|smtp/i.test(rawMessage);

      showToast({
        type: 'error',
        title: isMailError ? 'Email send failed' : 'Send failed',
        message: isMailError
          ? `${rawMessage}. Check your SMTP settings or connection.`
          : rawMessage || 'Could not send email. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <BaseModal
        open={true}
        title={title}
        size="md"
        onClose={onClose}
        onSubmit={handleSend}
        saving={isSending}
        saveLabel={saveLabel}
        submitDisabled={!emailData.subject.trim() || !emailData.body.trim()}
      >
        <div className="space-y-4">
          {/* Recipient + subject summary (read-only) */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
            <p className="text-blue-800">
              <strong>To:</strong> {pkg.recipient?.email ?? '—'}
            </p>
            <p className="text-blue-800">
              <strong>Subject:</strong> {emailData.subject}
            </p>
          </div>

          {/* Body */}
          <FieldWrapper label="Email Body" required>
            <TextLikeField
              as="textarea"
              rows={10}
              value={emailData.body}
              onChange={(v: string) => setEmailData((e) => ({ ...e, body: v }))}
            />
          </FieldWrapper>
        </div>
      </BaseModal>
      <ToastContainer />
    </>
  );
}
