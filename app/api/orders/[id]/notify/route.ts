// ===== ORDER NOTIFY (app/api/orders/[id]/notify/route.ts) =====
//
// Explicitly-triggered order email — paralleling /api/notifications for
// packages. The frontend builds the subject/body (optionally pre-filled
// from lib/notifications/orderEmailTemplates.ts so the user can preview
// and edit before sending) and POSTs here.
//
// TODO (notification logging): when the OrderNotification model lands,
// switch this to a sendAndLogOrderNotification helper that mirrors
// sendAndLogNotification (send first, log best-effort).

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendOrderEmail } from '@/lib/notifications/sendOrderEmail';
import type { OrderEmailType } from '@/lib/notifications/orderEmailTemplates';
import { prisma } from '@/lib/prisma';

const VALID_TYPES: OrderEmailType[] = [
  'ORDER_REQUESTED',
  'ORDER_PURCHASED',
  'ORDER_COMPLETED',
  'ORDER_CANCELLED',
  'CUSTOM',
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // TODO: replace with role-based auth (admin/secretary check)
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      to,
      subject,
      body: messageBody,
      recipientName,
      type,
    } = body;

    if (!to || !subject || !messageBody || !type) {
      return NextResponse.json(
        { error: 'Missing required field: to, subject, body, or type' },
        { status: 400 },
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid order email type: ${type}` },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await sendOrderEmail({
      orderId: id,
      recipientEmail: to,
      recipientName: recipientName ?? null,
      type,
      subject,
      body: messageBody,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error sending order notification:', error);
    const message =
      error instanceof Error && error.message.includes('Mail')
        ? error.message
        : 'Failed to send notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
