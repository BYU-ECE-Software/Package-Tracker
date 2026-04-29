// lib/email/index.ts
// Public API for the email module. Drop this whole folder into a new project
// and you can send branded notification emails with one function call.
//
// Usage:
//   import { sendNotification } from '@/lib/email';
//   await sendNotification({
//     to: 'user@example.com',
//     recipientName: 'Jane',
//     subject: 'Welcome',
//     body: 'Thanks for signing up.',
//   });
//
// For lower-level access (custom HTML, attachments) import sendMail directly.

import sendMail, { type SendMailParams } from './mailer';
import { renderEmailTemplate, renderPlainText } from './template';

export { default as sendMail } from './mailer';
export type { SendMailParams } from './mailer';
export { renderEmailTemplate, renderPlainText } from './template';

// PT-specific: package-aware email + Notification table logging.
export {
  sendAndLogNotification,
  type SendAndLogNotificationParams,
} from './notifications';

export interface SendNotificationParams {
  to: string | string[];
  recipientName: string;
  subject: string;
  body: string;
  appName?: string;
  footerText?: string;
  attachments?: SendMailParams['attachments'];
}

/** Render the standard branded template + plain-text fallback, then send. */
export async function sendNotification({
  to,
  recipientName,
  subject,
  body,
  appName,
  footerText,
  attachments,
}: SendNotificationParams) {
  const html = renderEmailTemplate({ name: recipientName, subject, body, appName, footerText });
  const text = renderPlainText({ name: recipientName, body, appName, footerText });
  return sendMail({ to, subject, html, text, attachments });
}
