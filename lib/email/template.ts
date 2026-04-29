// lib/email/template.ts
// Generic HTML + plain-text email rendering. App identity (name, footer text)
// is parameterized so this file is reusable across projects without edits.
//
// Defaults read from NEXT_PUBLIC_APP_NAME / NEXT_PUBLIC_APP_FOOTER. Pass
// `appName` / `footerText` explicitly if you need per-message overrides.

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>{{subject}}</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Hello {{name}},</p>
    <div>{{body}}</div>
    <p>
      Best regards,<br />
      <strong>{{appName}}</strong>
    </p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
    <p style="font-size: 12px; color: #666;">{{footerText}}</p>
  </body>
</html>
`;

interface TemplateParams {
  name: string;
  subject: string;
  body: string;
  appName?: string;
  footerText?: string;
}

const defaultAppName = () => process.env.NEXT_PUBLIC_APP_NAME ?? 'App';
const defaultFooter = () =>
  process.env.NEXT_PUBLIC_APP_FOOTER ?? 'This is an automated notification.';

export function renderEmailTemplate({
  name,
  subject,
  body,
  appName = defaultAppName(),
  footerText = defaultFooter(),
}: TemplateParams): string {
  const bodyWithBreaks = (body || '').replace(/\n/g, '<br />');

  return HTML_TEMPLATE.replace(/{{name}}/g, name || 'there')
    .replace(/{{subject}}/g, subject || 'Notification')
    .replace(/{{body}}/g, bodyWithBreaks)
    .replace(/{{appName}}/g, appName)
    .replace(/{{footerText}}/g, footerText);
}

export function renderPlainText({
  name,
  body,
  appName = defaultAppName(),
  footerText = defaultFooter(),
}: Pick<TemplateParams, 'name' | 'body' | 'appName' | 'footerText'>): string {
  return `Hello ${name || 'there'},

${body || ''}

Best regards,
${appName}

---
${footerText}
`;
}
