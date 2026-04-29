// ===== EMAIL SEND API (app/api/email/send/route.ts) =====
// Sends a package-related email and logs it as a Notification, flipping
// the package's notificationSent flag to true.

import { NextRequest, NextResponse } from 'next/server';
import { sendAndLogNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      subject,
      body: messageBody,
      recipientName,
      packageId,
      recipientId,
    } = body;

    if (!to || !subject || !messageBody || !packageId || !recipientId) {
      return NextResponse.json(
        {
          error:
            'Missing required field: to, subject, body, packageId, or recipientId',
        },
        { status: 400 },
      );
    }

    await sendAndLogNotification({
      packageId,
      recipientId,
      recipientEmail: to,
      recipientName: recipientName ?? null,
      subject,
      body: messageBody,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error sending email:', error);
    const message =
      error instanceof Error && error.message.includes('Mail')
        ? error.message
        : 'Failed to send email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
