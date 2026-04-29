// PT-specific notification helper: send a package notification email and
// log it to the Notification table, flipping Package.notificationSent in
// the same transaction. Both /api/packages POST and /api/email/send funnel
// through this so logging stays consistent.
//
// This file is the only piece of lib/email/ that's PT-specific (the rest —
// mailer.ts, template.ts, and the sendNotification helper in index.ts —
// are generic and can be lifted into another project as-is).

import { prisma } from '@/lib/prisma';
import sendMail from './mailer';
import { renderEmailTemplate, renderPlainText } from './template';

// Brand-locked here so PT emails retain the "ECE Mailroom" voice without
// requiring callers (or env vars) to keep the strings in sync.
const APP_NAME = 'ECE Mailroom';
const FOOTER_TEXT =
  'This is an automated notification from the BYU ECE Package Tracker.';

export type SendAndLogNotificationParams = {
  packageId: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  body: string;
};

export async function sendAndLogNotification({
  packageId,
  recipientId,
  recipientEmail,
  recipientName,
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

  // Best-effort logging + status flip. Mail already left the building, so
  // a DB hiccup here shouldn't propagate as a send failure to the caller.
  try {
    await prisma.$transaction([
      prisma.notification.create({
        data: { packageId, recipientId, subject, body },
      }),
      prisma.package.update({
        where: { id: packageId },
        data: { notificationSent: true },
      }),
    ]);
  } catch (error) {
    console.error(
      `Failed to log notification for package ${packageId} (email already sent):`,
      error,
    );
  }
}
