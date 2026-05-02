const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"EMRS - WellFluid" <${config.email.from}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    };

    if (config.nodeEnv === 'development') {
      logger.info('Email would be sent:', { to, subject });
      return { success: true, messageId: 'dev-mode' };
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent:', { to, subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email failed:', { to, subject, error: error.message });
    throw error;
  }
};

const sendPasswordReset = async (email, resetToken, userName) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #FF6B00; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">EMRS</h1>
        <p style="color: white; margin: 5px 0;">WellFluid Services</p>
      </div>
      <div style="padding: 30px; background: #f5f5f5;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested a password reset. Click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #FF6B00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Link expires in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'EMRS - Password Reset',
    html
  });
};

const sendWelcome = async (email, userName, tempPassword) => {
  const loginUrl = `${config.frontendUrl}/login`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #FF6B00; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">EMRS</h1>
        <p style="color: white; margin: 5px 0;">WellFluid Services</p>
      </div>
      <div style="padding: 30px; background: #f5f5f5;">
        <h2 style="color: #333;">Welcome to EMRS!</h2>
        <p>Hello ${userName},</p>
        <p>Your account has been created. Here are your login details:</p>
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p>Please change your password after first login.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: #FF6B00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login Now
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'EMRS - Welcome to WellFluid Services',
    html
  });
};

module.exports = { sendEmail, sendPasswordReset, sendWelcome };
