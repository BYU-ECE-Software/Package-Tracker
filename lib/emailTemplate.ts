// lib/emailTemplate.ts

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
      <strong>ECE Mailroom</strong>
    </p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
    <p style="font-size: 12px; color: #666;">
      This is an automated notification from the BYU ECE Package Tracker.
    </p>
  </body>
</html>
`;

interface TemplateParams {
  name: string;
  subject: string;
  body: string;
}

export function renderEmailTemplate({ name, subject, body }: TemplateParams): string {
  let html = HTML_TEMPLATE;
  
  // Convert newlines to <br> tags for HTML rendering
  const bodyWithBreaks = (body || 'You have a notification from the ECE Mailroom.')
    .replace(/\n/g, '<br />');
  
  html = html.replace(/{{name}}/g, name || 'User');
  html = html.replace(/{{subject}}/g, subject || 'Package Notification');
  html = html.replace(/{{body}}/g, bodyWithBreaks);
  
  return html;
}

export function renderPlainText({ name, body }: Pick<TemplateParams, 'name' | 'body'>): string {
  return `Hello ${name || 'User'},

${body || 'You have a notification from the ECE Mailroom.'}

Best regards,
ECE Mailroom

---
This is an automated notification from the BYU ECE Package Tracker.
`;
}