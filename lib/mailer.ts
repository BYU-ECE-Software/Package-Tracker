// lib/mailer.ts
import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions, SentMessageInfo } from 'nodemailer';

// Lazy-init transporter - only create when first needed
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    
    // Guard against missing/invalid config
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
      auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });

    console.log('✉️  Mail transporter created');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${port}`);
    console.log(`   Secure: ${process.env.SMTP_SECURE}`);
  }

  return transporter;
}

interface SendMailParams {
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

  // Verify connection only when actually sending
  try {
    await transport.verify();
    console.log('✓ SMTP connection verified');
  } catch (error) {
    console.error('✗ SMTP verification failed:', error);
    throw new Error('Mail server connection failed. Check SMTP configuration.');
  }

  try {
    const from = process.env.FROM_NAME
      ? `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`
      : process.env.FROM_EMAIL;

    if (!from) {
      throw new Error('FROM_EMAIL is not configured');
    }

    const mailOptions: SendMailOptions = {
      from,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
      attachments: attachments || [],
    };

    const info: SentMessageInfo = await transport.sendMail(mailOptions);
    console.log('✓ Email sent:', info.messageId);

    // For Ethereal test accounts, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Preview URL:', previewUrl);
    }

    return info;
  } catch (error) {
    console.error('✗ Error sending email:', error);
    throw error;
  }
}