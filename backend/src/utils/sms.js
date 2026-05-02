/**
 * SMS Service (Termii)
 * Sends SMS notifications to users via Termii API
 * 
 * Environment variables needed:
 * - TERMII_API_KEY: Your Termii API key
 * - TERMII_SENDER_ID: Your registered sender ID (e.g., "WellFluid")
 * - SMS_ENABLED: Set to 'true' to enable SMS sending
 */

const config = require('../config/env');
const logger = require('./logger');

// Termii API endpoint
const TERMII_API_URL = 'https://api.ng.termii.com/api/sms/send';

/**
 * Format Nigerian phone number to international format
 * Handles: 08012345678, +2348012345678, 2348012345678
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove spaces, dashes, and other characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // If starts with 0, replace with 234
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.slice(1);
  }
  
  // If starts with +, remove it
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  
  // Validate: should be 13 digits starting with 234
  if (cleaned.length === 13 && cleaned.startsWith('234')) {
    return cleaned;
  }
  
  logger.warn('Invalid phone number format:', { original: phone, cleaned });
  return null;
};

/**
 * Send SMS via Termii
 */
const sendSMS = async ({ to, message }) => {
  // Check if SMS is enabled
  if (!config.sms?.enabled) {
    logger.info('SMS disabled - would send:', { to, message: message.slice(0, 50) + '...' });
    return { success: true, messageId: 'sms-disabled', simulated: true };
  }

  // Validate configuration
  if (!config.sms?.apiKey || !config.sms?.senderId) {
    logger.error('SMS configuration missing. Set TERMII_API_KEY and TERMII_SENDER_ID');
    return { success: false, error: 'SMS not configured' };
  }

  // Format phone number
  const formattedPhone = formatPhoneNumber(to);
  if (!formattedPhone) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const response = await fetch(TERMII_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: config.sms.apiKey,
        to: formattedPhone,
        from: config.sms.senderId,
        sms: message,
        type: 'plain',
        channel: 'generic' // or 'dnd' for DND-enabled routes
      })
    });

    const data = await response.json();

    if (data.code === 'ok' || response.ok) {
      logger.info('SMS sent successfully:', { to: formattedPhone, messageId: data.message_id });
      return { success: true, messageId: data.message_id };
    } else {
      logger.error('SMS failed:', { to: formattedPhone, error: data });
      return { success: false, error: data.message || 'SMS sending failed' };
    }
  } catch (error) {
    logger.error('SMS error:', { to: formattedPhone, error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Send notification via both Email and SMS
 * Gracefully handles missing contact info
 */
const sendNotification = async ({ user, subject, message, htmlMessage }) => {
  const results = {
    email: null,
    sms: null
  };

  // Send email if email exists
  if (user.email) {
    try {
      const { sendEmail } = require('./email');
      results.email = await sendEmail({
        to: user.email,
        subject,
        html: htmlMessage || message,
        text: message
      });
    } catch (err) {
      logger.error('Email notification failed:', { email: user.email, error: err.message });
      results.email = { success: false, error: err.message };
    }
  }

  // Send SMS if phone exists
  if (user.phone) {
    results.sms = await sendSMS({
      to: user.phone,
      message: message.slice(0, 160) // SMS limit
    });
  }

  return results;
};

// =====================================================
// PRE-BUILT NOTIFICATION TEMPLATES
// =====================================================

/**
 * Notify accounts when work order is completed
 */
const notifyAccountsWorkOrderCompleted = async (workOrder, accountsUsers) => {
  const isHighCost = workOrder.actual_cost >= 100000;
  const costFormatted = `₦${workOrder.actual_cost?.toLocaleString() || '0'}`;
  
  const subject = isHighCost 
    ? `⚠️ High-Cost Work Order Completed - ${costFormatted}`
    : `Work Order Completed - ${costFormatted}`;
  
  const message = `EMRS: Work Order WO-${workOrder.id?.slice(0, 8)} completed. Equipment: ${workOrder.equipment_name || 'N/A'}. Cost: ${costFormatted}. Please review and record payment.`;
  
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #FF6B00; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">EMRS</h1>
        <p style="color: white; margin: 5px 0;">WellFluid Services</p>
      </div>
      <div style="padding: 30px; background: #f5f5f5;">
        <h2 style="color: #333;">${isHighCost ? '⚠️ ' : ''}Work Order Completed</h2>
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Work Order:</strong> WO-${workOrder.id?.slice(0, 8)}</p>
          <p><strong>Equipment:</strong> ${workOrder.equipment_name || 'N/A'}</p>
          <p><strong>Actual Cost:</strong> <span style="color: ${isHighCost ? '#E74C3C' : '#2ECC71'}; font-size: 18px;">${costFormatted}</span></p>
          <p><strong>Completed At:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Please log in to EMRS to review and record the final payment.</p>
      </div>
    </div>
  `;

  const results = [];
  for (const user of accountsUsers) {
    const result = await sendNotification({
      user,
      subject,
      message,
      htmlMessage
    });
    results.push({ userId: user.id, ...result });
  }

  return results;
};

/**
 * Notify when payment is recorded
 */
const notifyPaymentRecorded = async (workOrder, recordedBy, notifyUsers = []) => {
  const costFormatted = `₦${workOrder.accounts_final_payment?.toLocaleString() || '0'}`;
  
  const message = `EMRS: Payment of ${costFormatted} recorded for Work Order WO-${workOrder.id?.slice(0, 8)} by ${recordedBy.first_name} ${recordedBy.last_name}.`;
  
  const results = [];
  for (const user of notifyUsers) {
    const result = await sendSMS({
      to: user.phone,
      message
    });
    results.push({ userId: user.id, ...result });
  }

  return results;
};

module.exports = {
  sendSMS,
  sendNotification,
  formatPhoneNumber,
  notifyAccountsWorkOrderCompleted,
  notifyPaymentRecorded
};
