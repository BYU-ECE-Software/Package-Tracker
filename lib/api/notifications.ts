import type { NotificationType } from '@prisma/client';

export type SendNotificationRequest = {
  to: string;
  subject: string;
  body: string;
  recipientName?: string;
  packageId: string;
  recipientId: string;
  type: NotificationType;
};

export async function sendNotification(data: SendNotificationRequest): Promise<void> {
  const res = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Failed to send notification' }));
    throw new Error(body.error || 'Failed to send notification');
  }
}
