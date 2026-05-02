/**
 * Activity Logs Routes
 * All users can see their own logs
 * Managers can see department logs
 * Admins can see all logs
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { 
  getActivityLogs, 
  getUserActivity,
  getActionTypes,
  getEntityTypes
} = require('./activity.controller');

// All routes require authentication
router.use(authenticate);

// Get activity logs (role-based filtering applied)
router.get('/', getActivityLogs);

// Get action types for filter dropdown
router.get('/actions', getActionTypes);

// Get entity types for filter dropdown
router.get('/entities', getEntityTypes);

// Get specific user's activity
router.get('/user/:userId', getUserActivity);

module.exports = router;
