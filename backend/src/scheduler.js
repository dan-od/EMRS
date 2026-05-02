/**
 * Task Scheduler
 * Runs scheduled tasks like overdue reminders
 * Uses setInterval for simplicity - can be replaced with node-cron for production
 */

const logger = require('./utils/logger');
const { query } = require('./config/db');
const overdueReminders = require('./modules/requests/overdueReminders.service');

// Run every 24 hours (in milliseconds)
const DAILY_INTERVAL = 24 * 60 * 60 * 1000;

// Run every hour for testing (can switch to DAILY_INTERVAL for production)
const HOURLY_INTERVAL = 60 * 60 * 1000;

let overdueReminderTimer = null;
let denylistCleanupTimer = null;

/**
 * Start the scheduler
 */
const startScheduler = () => {
  logger.info('Starting task scheduler...');

  // Run overdue reminders check daily
  // For production, consider using node-cron for more precise scheduling
  overdueReminderTimer = setInterval(async () => {
    try {
      logger.info('Running scheduled overdue reminder check...');
      const result = await overdueReminders.processOverdueReminders();
      logger.info('Overdue reminder check complete', result);
    } catch (error) {
      logger.error('Scheduled task error', { message: error.message, stack: error.stack });
    }
  }, DAILY_INTERVAL);

  // Also run once on startup (after a short delay to let DB connect)
  setTimeout(async () => {
    try {
      logger.info('Running initial overdue reminder check...');
      await overdueReminders.processOverdueReminders();
    } catch (error) {
      logger.error('Initial overdue check failed', { message: error.message });
    }
  }, 10000); // 10 second delay

  // Clean up expired token denylist entries daily
  denylistCleanupTimer = setInterval(async () => {
    try {
      const result = await query('DELETE FROM token_denylist WHERE expires_at < NOW()');
      logger.debug('Token denylist cleanup complete', { deleted: result.rowCount });
    } catch (error) {
      logger.error('Token denylist cleanup failed', { message: error.message });
    }
  }, DAILY_INTERVAL);

  logger.info('Task scheduler started. Overdue reminders and denylist cleanup will run daily.');
};

/**
 * Stop the scheduler
 */
const stopScheduler = () => {
  if (overdueReminderTimer) {
    clearInterval(overdueReminderTimer);
    overdueReminderTimer = null;
  }
  if (denylistCleanupTimer) {
    clearInterval(denylistCleanupTimer);
    denylistCleanupTimer = null;
  }
  logger.info('Task scheduler stopped.');
};

module.exports = {
  startScheduler,
  stopScheduler
};
