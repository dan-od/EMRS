// Notifications routes
const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');

// All routes require authentication
router.use(authenticate);

// Get my notifications
router.get('/', controller.getMyNotifications);

// Get unread count
router.get('/unread-count', controller.getUnreadCount);

// Mark all as read
router.patch('/read-all', controller.markAllAsRead);

// Mark single as read
router.patch('/:id/read', controller.markAsRead);

// Create notification (Admin only - for testing/manual notifications)
router.post('/', requireRoles(['Super_Admin', 'Admin']), controller.createNotification);

module.exports = router;