const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/**
 * Create a nodemailer transporter
 */
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send verification email to user
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} token - Verification token
 * @returns {Promise<boolean>} - Success status
 */
exports.sendVerificationEmail = async (to, name, token) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Email Verification',
      html: `
        <h1>Email Verification</h1>
        <p>Hello ${name},</p>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to: ${to}`);
    return true;
  } catch (error) {
    logger.error(`Error sending verification email: ${error.message}`);
    return false;
  }
};

/**
 * Send password reset email to user
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} token - Reset token
 * @returns {Promise<boolean>} - Success status
 */
exports.sendPasswordResetEmail = async (to, name, token) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;
    const resetUrl = `${baseUrl}/api/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Password Reset',
      html: `
        <h1>Password Reset</h1>
        <p>Hello ${name},</p>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${to}`);
    return true;
  } catch (error) {
    logger.error(`Error sending password reset email: ${error.message}`);
    return false;
  }
};

/**
 * Send admin invitation email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} password - Temporary password
 * @param {string} invitedBy - Name of admin who sent the invitation
 * @returns {Promise<boolean>} - Success status
 */
exports.sendAdminInvitationEmail = async (to, name, password, invitedBy) => {
  try {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;
    const loginUrl = `${baseUrl}/api/docs/admin`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Admin Account Invitation',
      html: `
        <h1>Admin Account Invitation</h1>
        <p>Hello ${name},</p>
        <p>You have been invited by <strong>${invitedBy}</strong> to join as an administrator.</p>
        <p>Your account has been created with the following credentials:</p>
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please use these credentials to log in to the admin panel:</p>
        <a href="${loginUrl}">Go to Admin Login</a>
        <p>For security reasons, we recommend changing your password after your first login.</p>
        <p>If you believe this invitation was sent in error, please contact the system administrator.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Admin invitation email sent to: ${to}`);
    return true;
  } catch (error) {
    logger.error(`Error sending admin invitation email: ${error.message}`);
    return false;
  }
};
