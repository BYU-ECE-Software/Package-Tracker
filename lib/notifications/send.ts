// PT-specific notification helper: send a package notification email and
// log it to the Notification table. Both /api/packages POST and
// /api/notifications funnel through this so logging stays consistent.
//
// This file holds PT branding + DB logging. The pure email primitives in
// lib/email/ (mailer, template) stay generic and upstreamable.

import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';
import sendMail from '@/lib/email/mailer';
import { renderEmailTemplate, renderPlainText } from '@/lib/email/template';

const APP_NAME = 'ECE Mailroom';
const FOOTER_TEXT =
  'This is an automated notification from the BYU ECE Package Tracker.';

export type SendAndLogNotificationParams = {
  packageId: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string | null;
  type: NotificationType;
  subject: string;
  body: string;
};

export async function sendAndLogNotification({
  packageId,
  recipientId,
  recipientEmail,
  recipientName,
  type,
  subject,
  body,
}: SendAndLogNotificationParams): Promise<void> {
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

  // Send first — if mail fails we don't want a Notification row for an
  // email that never went out.
  await sendMail({ to: recipientEmail, subject, text, html });

  // Best-effort logging. Mail already left the building, so a DB hiccup
  // here shouldn't propagate as a send failure to the caller.
  try {
    await prisma.notification.create({
      data: { packageId, recipientId, type, subject, body },
    });
  } catch (error) {
    console.error(
      `Failed to log notification for package ${packageId} (email already sent):`,
      error,
    );
  }
}
