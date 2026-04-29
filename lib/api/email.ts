// ============================================
// Email API Functions
// ============================================

export type SendEmailRequest = {
  to: string;
  subject: string;
  body: string;
  recipientName?: string;
  packageId: string;
  recipientId: string;
};

export async function sendEmail(data: SendEmailRequest): Promise<void> {
  const res = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Failed to send email' }));
    throw new Error(body.error || 'Failed to send email');
  }
}
