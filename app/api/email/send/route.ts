// ===== MANUAL EMAIL SEND (app/api/email/send/route.ts) =====
//
// Mirrors the Purchase-Tracker's POST /api/email/send. Pass { to, subject,
// message, name } and the message gets rendered through the generic
// template + sent via the shared mailer.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sendMail from '@/lib/email/mailer';
import { renderEmailTemplate, renderPlainText } from '@/lib/email/template';

const APP_NAME = 'ECE Purchasing';
const FOOTER_TEXT =
  'This is an automated notification from the BYU ECE Purchase Tracker.';

export async function POST(request: NextRequest) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const body = await request.json();
    const { to, subject, message, name } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'to, subject, and message are required' },
        { status: 400 },
      );
    }

    const recipientName = name ?? 'there';

    const html = renderEmailTemplate({
      name: recipientName,
      subject,
      body: message,
      appName: APP_NAME,
      footerText: FOOTER_TEXT,
    });
    const text = renderPlainText({
      name: recipientName,
      body: message,
      appName: APP_NAME,
      footerText: FOOTER_TEXT,
    });

    await sendMail({ to, subject, text, html });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Manual email send failed:', error);
    const detail = error instanceof Error ? error.message : 'Failed to send email';
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
