"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.createVerificationEmail = exports.createResetConfirmationEmail = exports.createResetPasswordEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const emailConfig_1 = require("../email/emailConfig");
const getEnvVar_1 = __importDefault(require("../utils/getEnvVar"));
mail_1.default.setApiKey((0, getEnvVar_1.default)('SENDGRID_API_KEY'));
// Common email header and footer
const emailHeader = `
  <div style="font-family: Arial, sans-serif;">
    <h1>Welcome to Our Service</h1>
`;
const emailFooter = `
    <p>Best regards,<br/>The Team @ ApiAi</p>
  </div>
`;
const wrapWithHeaderFooter = (content) => `${emailHeader}${content}${emailFooter}`;
const createResetPasswordEmail = (receiverEmail, resetTokenValue) => {
    const content = `
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process within 30 minutes:
    <a href="${emailConfig_1.protocol}://${emailConfig_1.host}/reset-password/set/${resetTokenValue}">Reset Password</a></p>
    <p>This link will expire in 30 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;
    return {
        to: receiverEmail,
        from: emailConfig_1.sendingEmail,
        subject: 'Reset password link',
        html: wrapWithHeaderFooter(content),
    };
};
exports.createResetPasswordEmail = createResetPasswordEmail;
const createResetConfirmationEmail = (receiverEmail) => {
    const content = `
    <p>This is a confirmation that the password for your account <strong>${receiverEmail}</strong> has just been changed.</p>
    <p>If you did not initiate this change, please contact our support team immediately.</p>
  `;
    return {
        to: receiverEmail,
        from: emailConfig_1.sendingEmail,
        subject: 'Your password has been changed',
        html: wrapWithHeaderFooter(content),
    };
};
exports.createResetConfirmationEmail = createResetConfirmationEmail;
const createVerificationEmail = (receiverEmail, verificationTokenValue) => {
    const content = `<p>Please verify your account by clicking the link:
  <a href="${emailConfig_1.protocol}://${emailConfig_1.host}/confirm/${verificationTokenValue}">Verify Email</a></p>`;
    return {
        to: receiverEmail,
        from: emailConfig_1.sendingEmail,
        subject: 'Email Verification',
        html: wrapWithHeaderFooter(content),
    };
};
exports.createVerificationEmail = createVerificationEmail;
const sendEmail = async (email) => {
    await mail_1.default.send(email);
};
exports.sendEmail = sendEmail;
exports.default = {
    createResetPasswordEmail: exports.createResetPasswordEmail,
    createResetConfirmationEmail: exports.createResetConfirmationEmail,
    createVerificationEmail: exports.createVerificationEmail,
    sendEmail: exports.sendEmail,
};
//# sourceMappingURL=email.service.js.map