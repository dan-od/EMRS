// Notifications controller
const notificationsService = require('./notifications.service');
const { logActivity } = require('../../utils/activityLogger');

/**
 * Get notifications for current user
 * GET /notifications
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await notificationsService.getByUser(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread count
 * GET /notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationsService.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PATCH /notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationsService.markAsRead(id, req.user.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await notificationsService.markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create notification (internal/admin use)
 * POST /notifications
 */
const createNotification = async (req, res, next) => {
  try {
    const { userId, type, title, message, referenceType, referenceId, priority } = req.body;
    
    const notification = await notificationsService.create({
      userId,
      type: type || 'GENERAL',
      title,
      message,
      referenceType,
      referenceId,
      priority
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification
};
