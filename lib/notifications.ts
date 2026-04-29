// Shared server helper: send a package notification email and log it.
// Both the in-line email path in /api/packages POST and the dedicated
// /api/email/send route should funnel through here so logging stays
// consistent.

import { prisma } from '@/lib/prisma';
import sendMail from '@/lib/mailer';
import { renderEmailTemplate, renderPlainText } from '@/lib/emailTemplate';

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
  });
  const text = renderPlainText({
    name: recipientName ?? 'there',
    body,
  });

  // Send first — if mail fails we don't want a Notification row for an
  // email that never went out.
  await sendMail({ to: recipientEmail, subject, text, html });

  // Best-effort logging + status flip. Mail already left the building, so
  // a DB hiccup here shouldn't propagate as a send failure to the caller.
  try {
    await prisma.$transaction([
      prisma.notification.create({
        data: {
          packageId,
          recipientId,
          subject,
          body,
        },
      }),
      prisma.package.update({
        where: { id: packageId },
        data: { notificationSent: true },
      }),
    ]);
  } catch (error) {
    console.error(
      `✗ Failed to log notification for package ${packageId} (email already sent):`,
      error,
    );
  }
}
