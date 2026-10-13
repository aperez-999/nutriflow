import nodemailer from 'nodemailer';

// Outgoing email (password resets, contact form) through the Gmail account in
// EMAIL_USERNAME / EMAIL_PASSWORD.

export const isMailConfigured = () => Boolean(process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD);

/** Escapes text placed into email HTML, so user input cannot add markup. */
export const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export function sendMail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD },
  });
  return transporter.sendMail({ from: process.env.EMAIL_USERNAME, to, subject, html });
}
