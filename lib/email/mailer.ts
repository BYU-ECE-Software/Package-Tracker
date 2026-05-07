// Generic SMTP transport. Reads SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER /
// SMTP_PASS / FROM_EMAIL / FROM_NAME from the environment. No app-specific logic.

// console.log here is intentional: SMTP config diagnostics on first transport
// creation, and the Ethereal preview URL after a dev send.
/* eslint-disable no-console */

import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions, SentMessageInfo } from 'nodemailer';

const FORCE_EMAIL_FAILURE = process.env.FORCE_EMAIL_FAILURE === 'true';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);

    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP_HOST is not configured');
    }
    if (isNaN(port)) {
      throw new Error('SMTP_PORT is not configured or invalid');
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });

    console.log('Mail transporter created');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${port}`);
    console.log(`   Secure: ${process.env.SMTP_SECURE}`);
  }

  return transporter;
}

export interface SendMailParams {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: SendMailOptions['attachments'];
}

export default async function sendMail({
  to,
  subject,
  text,
  html,
  attachments,
}: SendMailParams): Promise<SentMessageInfo> {
  const transport = getTransporter();

  try {
    await transport.verify();
  } catch (error) {
    console.error('SMTP verification failed:', error);
    throw new Error('Mail server connection failed. Check SMTP configuration.');
  }

  // Test hook: simulate a send failure for error-path tests.
  if (FORCE_EMAIL_FAILURE) {
    throw new Error('Simulated email failure for testing');
  }

  const from = process.env.FROM_NAME
    ? `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`
    : process.env.FROM_EMAIL;

  if (!from) {
    throw new Error('FROM_EMAIL is not configured');
  }

  const info: SentMessageInfo = await transport.sendMail({
    from,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
    attachments: attachments || [],
  });

  // Ethereal test accounts return a preview URL — log it so devs can click.
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('Email preview URL:', previewUrl);
  }

  return info;
}
