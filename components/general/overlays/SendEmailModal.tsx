// Generic compose-and-send modal. Pure UI: it shows a recipient summary +
// (optionally editable) subject + body, then hands the typed payload to the
// parent's `onSend` callback. The parent decides where it goes (POST
// /api/email/send, a server action calling lib/email's sendNotification,
// etc.) — keeps the modal decoupled from any particular API contract.
//
// The `subjectEditable` prop controls how the subject is presented:
//   - true  (default): subject renders as a TextLikeField the user can edit.
//   - false: subject is shown read-only inside the To/Subject summary card,
//     matching a "you're sending the canned reminder, just confirm and go"
//     UX. The supplied defaultSubject still flows through to onSend.
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import BaseModal from '@/components/general/overlays/BaseModal';
import FieldWrapper from '@/components/general/forms/FieldWrapper';
import TextLikeField from '@/components/general/forms/TextLikeField';

export type SendEmailPayload = {
  to: string;
  subject: string;
  body: string;
};

export interface SendEmailModalProps {
  /** Recipient. `email` is required; `name` shows in the summary card and is passed to the body template. */
  recipient: { name?: string; email: string };
  /** Pre-fills the subject input. Used as the literal subject when `subjectEditable` is false. */
  defaultSubject?: string;
  /** Pre-fills the body textarea. */
  defaultBody?: string;
  /** Modal header text. */
  title?: string;
  /** Submit-button label. */
  saveLabel?: string;
  /** When false, subject is read-only and rendered inside the summary card. Default: true. */
  subjectEditable?: boolean;
  /** Called with the typed payload. Throw to show an error toast. */
  onSend: (payload: SendEmailPayload) => Promise<void>;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SendEmailModal({
  recipient,
  defaultSubject = '',
  defaultBody = '',
  title = 'Send Email',
  saveLabel = 'Send Email',
  subjectEditable = true,
  onSend,
  onClose,
  onSuccess,
}: SendEmailModalProps) {
  const { showToast, ToastContainer } = useToast({ position: 'bottom-right' });

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipient.email) {
      showToast({
        type: 'error',
        title: 'No email on file',
        message: 'This recipient has no email address.',
      });
      return;
    }

    setIsSending(true);
    try {
      await onSend({ to: recipient.email, subject, body });
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
        submitDisabled={!subject.trim() || !body.trim()}
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
            <p className="text-blue-800">
              <strong>To:</strong>{' '}
              {recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}
            </p>
            {!subjectEditable && (
              <p className="text-blue-800">
                <strong>Subject:</strong> {subject}
              </p>
            )}
          </div>

          {subjectEditable && (
            <FieldWrapper label="Subject" required>
              <TextLikeField
                as="input"
                type="text"
                value={subject}
                onChange={(v: string) => setSubject(v)}
              />
            </FieldWrapper>
          )}

          <FieldWrapper label="Body" required>
            <TextLikeField
              as="textarea"
              rows={10}
              value={body}
              onChange={(v: string) => setBody(v)}
            />
          </FieldWrapper>
        </div>
      </BaseModal>
      <ToastContainer />
    </>
  );
}
