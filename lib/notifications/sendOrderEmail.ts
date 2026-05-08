// Site-specific order email helper. Holds purchasing-side branding and is
// the single funnel for any order-related email so future logging and
// templating live in one place.
//
// TODO (notification logging): the package side logs every send to a
// Notification row (see lib/notifications/send.ts). Orders deliberately do
// NOT log yet — schema changes are deferred. When ready, add an
// OrderNotification model paralleling Notification (orderId, recipientId,
// type, subject, body, sentAt) and write a row here after sendMail
// succeeds, mirroring sendAndLogNotification's best-effort try/catch.
//
// The pure email primitives in lib/email/ stay generic — do not edit those
// just for purchasing.

import sendMail from '@/lib/email/mailer';
import { renderEmailTemplate, renderPlainText } from '@/lib/email/template';
import type { OrderEmailType } from '@/lib/notifications/orderEmailTemplates';

export type { OrderEmailType };

const APP_NAME = 'ECE Purchasing';
const FOOTER_TEXT =
  'This is an automated notification from the BYU ECE Purchase Tracker.';

export type SendOrderEmailParams = {
  orderId: string;
  recipientEmail: string;
  recipientName: string | null;
  type: OrderEmailType;
  subject: string;
  body: string;
};

export async function sendOrderEmail({
  orderId,
  recipientEmail,
  recipientName,
  type,
  subject,
  body,
}: SendOrderEmailParams): Promise<void> {
  const html = renderEmailTemplate({
    name: recipientName ?? 'there',
    subject,
    body,
    appName: APP_NAME,
    footerText: FOOTER_TEXT,
  });
  const text = renderPlainText({
    name: recipientName ?? 'there',
    body,
    appName: APP_NAME,
    footerText: FOOTER_TEXT,
  });

  await sendMail({ to: recipientEmail, subject, text, html });

  // TODO (notification logging): once the OrderNotification model exists,
  // log a row here with { orderId, recipientId, type, subject, body }.
  // Use the same best-effort try/catch pattern as sendAndLogNotification:
  // mail already left, so a DB hiccup must not surface as a send failure.
  void orderId;
  void type;
}
