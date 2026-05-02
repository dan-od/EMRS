/**
 * Overdue Return Reminder Service
 * Sends reminders for overdue equipment returns
 * - On due date: Notify requester
 * - 1 week after due date: Notify requester + department manager
 */

const { query } = require('../../config/db');
const notificationsService = require('../notifications/notifications.service');
const logger = require('../../utils/logger');

/**
 * Find requests that are overdue and haven't received reminders
 */
const findOverdueRequests = async () => {
  const result = await query(`
    SELECT
      r.*,
      u.first_name || ' ' || u.last_name as requester_name,
      u.email as requester_email,
      u.department as requester_department,
      dm.id as department_manager_id,
      dm.first_name || ' ' || dm.last_name as manager_name,
      dm.email as manager_email
    FROM requests r
    JOIN users u ON r.requester_id = u.id
    LEFT JOIN LATERAL (
      SELECT id, first_name, last_name, email
      FROM users
      WHERE department = u.department
        AND role IN (
          'Maintenance_Manager', 'Safety_Manager',
          'Purchasing_Manager', 'Accounts_Manager', 'HR_Manager',
          'Logistics_Manager', 'Workshop_Manager', 'Operations_Manager'
        )
        AND is_active = true
      LIMIT 1
    ) dm ON true
    WHERE r.status = 'Disbursed'
      AND r.expected_return_date IS NOT NULL
      AND r.expected_return_date < NOW()
    ORDER BY r.expected_return_date ASC
  `);
  
  return result.rows;
};

/**
 * Send reminder to requester (on due date / just overdue)
 */
const sendRequesterReminder = async (request) => {
  // Don't send if already sent
  if (request.overdue_reminder_sent) return false;
  
  try {
    await notificationsService.create({
      userId: request.requester_id,
      type: 'RETURN_OVERDUE',
      title: '⚠️ Return Overdue',
      message: `Your ${request.type} request is overdue for return. Please return the items as soon as possible.`,
      referenceType: 'request',
      referenceId: request.id
    });
    
    // Mark reminder as sent
    await query(
      'UPDATE requests SET overdue_reminder_sent = TRUE WHERE id = $1',
      [request.id]
    );
    
    logger.info('Sent overdue reminder to requester', { requester: request.requester_name, requestId: request.id });
    return true;
  } catch (error) {
    logger.error('Failed to send requester reminder', { requestId: request.id, message: error.message });
    return false;
  }
};

/**
 * Send reminder to department manager (1 week overdue)
 */
const sendManagerReminder = async (request) => {
  // Don't send if already sent or no manager
  if (request.manager_reminder_sent || !request.department_manager_id) return false;
  
  // Check if 1 week overdue
  const dueDate = new Date(request.expected_return_date);
  const oneWeekAfter = new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  if (new Date() < oneWeekAfter) return false;
  
  try {
    // Notify manager
    await notificationsService.create({
      userId: request.department_manager_id,
      type: 'RETURN_OVERDUE_ESCALATION',
      title: '🚨 Equipment Return Escalation',
      message: `${request.requester_name}'s ${request.type} request has been overdue for over a week. Please follow up.`,
      referenceType: 'request',
      referenceId: request.id
    });
    
    // Also send another reminder to requester
    await notificationsService.create({
      userId: request.requester_id,
      type: 'RETURN_OVERDUE_URGENT',
      title: '🚨 URGENT: Return Required',
      message: `Your ${request.type} request is significantly overdue. Your manager has been notified. Please return items immediately.`,
      referenceType: 'request',
      referenceId: request.id
    });
    
    // Mark manager reminder as sent
    await query(
      'UPDATE requests SET manager_reminder_sent = TRUE WHERE id = $1',
      [request.id]
    );
    
    logger.info('Sent escalation to manager', { manager: request.manager_name, requestId: request.id });
    return true;
  } catch (error) {
    logger.error('Failed to send manager reminder', { requestId: request.id, message: error.message });
    return false;
  }
};

/**
 * Process all overdue requests and send appropriate reminders
 * Call this from a cron job (e.g., daily at 9 AM)
 */
const processOverdueReminders = async () => {
  logger.info('Processing overdue return reminders...');

  try {
    const overdueRequests = await findOverdueRequests();
    logger.info(`Found ${overdueRequests.length} overdue requests`);
    
    let requesterRemindersSent = 0;
    let managerRemindersSent = 0;
    
    for (const request of overdueRequests) {
      // First, ensure requester has been notified
      if (!request.overdue_reminder_sent) {
        const sent = await sendRequesterReminder(request);
        if (sent) requesterRemindersSent++;
      }
      
      // Then check for manager escalation (1 week overdue)
      if (!request.manager_reminder_sent) {
        const sent = await sendManagerReminder(request);
        if (sent) managerRemindersSent++;
      }
    }
    
    logger.info('Overdue reminders sent', { toRequesters: requesterRemindersSent, escalations: managerRemindersSent });
    
    return {
      totalOverdue: overdueRequests.length,
      requesterRemindersSent,
      managerRemindersSent
    };
  } catch (error) {
    logger.error('Error processing overdue reminders', { message: error.message });
    throw error;
  }
};

/**
 * Get summary of overdue requests (for dashboard)
 */
const getOverdueSummary = async () => {
  const result = await query(`
    SELECT 
      COUNT(*) FILTER (WHERE expected_return_date < NOW()) as total_overdue,
      COUNT(*) FILTER (WHERE expected_return_date < NOW() - INTERVAL '7 days') as week_overdue,
      COUNT(*) FILTER (WHERE expected_return_date < NOW() - INTERVAL '14 days') as two_weeks_overdue
    FROM requests
    WHERE status = 'Disbursed'
      AND expected_return_date IS NOT NULL
  `);
  
  return result.rows[0];
};

module.exports = {
  findOverdueRequests,
  sendRequesterReminder,
  sendManagerReminder,
  processOverdueReminders,
  getOverdueSummary
};
