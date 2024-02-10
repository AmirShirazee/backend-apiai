import sgMail from '@sendgrid/mail';
import { host, protocol, sendingEmail } from '../email/emailConfig';
import getEnvVar from '../utils/getEnvVar';

sgMail.setApiKey(getEnvVar('SENDGRID_API_KEY'));

// Common email header and footer
const emailHeader = `
  <div style="font-family: Arial, sans-serif;">
    <h1>Welcome to Our Service</h1>
`;

const emailFooter = `
    <p>Best regards,<br/>The Team @ ApiAi</p>
  </div>
`;

const wrapWithHeaderFooter = (content: string) => `${emailHeader}${content}${emailFooter}`;

export const createResetPasswordEmail = (
  receiverEmail: string,
  resetTokenValue: string,
): sgMail.MailDataRequired => {
  const content = `
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process within 30 minutes:
    <a href="${protocol}://${host}/reset-password/set/${resetTokenValue}">Reset Password</a></p>
    <p>This link will expire in 30 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;
  return {
    to: receiverEmail,
    from: sendingEmail,
    subject: 'Reset password link',
    html: wrapWithHeaderFooter(content),
  };
};

export const createResetConfirmationEmail = (receiverEmail: string): sgMail.MailDataRequired => {
  const content = `
    <p>This is a confirmation that the password for your account <strong>${receiverEmail}</strong> has just been changed.</p>
    <p>If you did not initiate this change, please contact our support team immediately.</p>
  `;
  return {
    to: receiverEmail,
    from: sendingEmail,
    subject: 'Your password has been changed',
    html: wrapWithHeaderFooter(content),
  };
};

export const createVerificationEmail = (
  receiverEmail: string,
  verificationTokenValue: string,
): sgMail.MailDataRequired => {
  const content = `<p>Please verify your account by clicking the link:
  <a href="${protocol}://${host}/confirm/${verificationTokenValue}">Verify Email</a></p>`;
  return {
    to: receiverEmail,
    from: sendingEmail,
    subject: 'Email Verification',
    html: wrapWithHeaderFooter(content),
  };
};

export const sendEmail = async (email: sgMail.MailDataRequired) => {
  await sgMail.send(email);
};

export default {
  createResetPasswordEmail,
  createResetConfirmationEmail,
  createVerificationEmail,
  sendEmail,
};
