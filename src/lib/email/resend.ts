import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const EMAIL_FROM = process.env.EMAIL_FROM || 'SV Cars <onboarding@resend.dev>';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const client = getResend();
  if (!client) {
    console.warn('[Email] RESEND_API_KEY not configured, skipping email');
    return;
  }

  try {
    const { error } = await client.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    if (error) {
      console.error('[Email] Resend error:', error);
    }
  } catch (err) {
    console.error('[Email] Failed to send:', err);
  }
}
