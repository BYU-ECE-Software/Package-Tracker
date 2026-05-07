// Sends a package-related email and logs it as a Notification.

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { NotificationType } from '@prisma/client';
import { sendAndLogNotification } from '@/lib/notifications/send';

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
      type,
    } = body;

    if (!to || !subject || !messageBody || !packageId || !recipientId || !type) {
      return NextResponse.json(
        {
          error:
            'Missing required field: to, subject, body, packageId, recipientId, or type',
        },
        { status: 400 },
      );
    }

    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type: ${type}` },
        { status: 400 },
      );
    }

    await sendAndLogNotification({
      packageId,
      recipientId,
      recipientEmail: to,
      recipientName: recipientName ?? null,
      type,
      subject,
      body: messageBody,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    const message =
      error instanceof Error && error.message.includes('Mail')
        ? error.message
        : 'Failed to send notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
