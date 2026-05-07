// Generic compose-and-send modal + the underlying form fields.
//
// SendEmailModal: self-contained modal (chrome + submit). Use when "send"
// is the whole user intent — e.g. the follow-up button on ViewPackageModal.
//
// SendEmailFormFields: the recipient card + subject + body fields, no chrome
// or submit. Use when these fields are part of a larger flow (e.g. a step
// in AddPackageModal's wizard) so the layout stays in one place.
//
// The `subjectEditable` prop controls how the subject is presented:
//   - true  (default): subject renders as a TextLikeField the user can edit.
//   - false: subject is shown read-only inside the To/Subject summary card.
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

export interface SendEmailFormFieldsProps {
  recipient: { name?: string; email: string };
  subject: string;
  onSubjectChange: (v: string) => void;
  body: string;
  onBodyChange: (v: string) => void;
  subjectEditable?: boolean;
}

export function SendEmailFormFields({
  recipient,
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  subjectEditable = true,
}: SendEmailFormFieldsProps) {
  return (
    <div>
      <div className="grid auto-rows-[auto_auto_auto] grid-cols-1">
        <FieldWrapper label="Subject" required className="-mb-2">
          <TextLikeField
            as="input"
            type="text"
            value={subject}
            onChange={onSubjectChange}
            disabled={!subjectEditable}
          />
        </FieldWrapper>

        <FieldWrapper label="Body" required>
          <TextLikeField
            as="textarea"
            rows={10}
            value={body}
            onChange={onBodyChange}
          />
        </FieldWrapper>
      </div>

      {recipient.email && (
        <p className="text-xs text-gray-500 -mt-4">
          Will send to: {recipient.email}
        </p>
      )}
    </div>
  );
}

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
        <SendEmailFormFields
          recipient={recipient}
          subject={subject}
          onSubjectChange={setSubject}
          body={body}
          onBodyChange={setBody}
          subjectEditable={subjectEditable}
        />
      </BaseModal>
      <ToastContainer />
    </>
  );
}
