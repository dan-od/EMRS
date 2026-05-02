/**
 * Main Routes Index
 * Aggregates all module routes
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Import route modules
const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const equipmentRoutes = require('../modules/equipment/equipment.routes');
const requestsRoutes = require('../modules/requests/requests.routes');
const jobsRoutes = require('../modules/jobs/jobs.routes');
const safetyRoutes = require('../modules/safety/safety.routes');
const purchasingRoutes = require('../modules/purchasing/purchasing.routes');
const activityRoutes = require('../modules/activity/activity.routes');
const maintenanceRoutes = require('../modules/maintenance/maintenance.routes');
const fieldReportsRoutes = require('../modules/field-reports/field-reports.routes');
const vendorsRoutes = require('../modules/vendors/vendors.routes');
const notificationsRoutes = require('../modules/notifications/notifications.routes');
const vehiclesRoutes = require('../modules/vehicles/vehicles.routes');
const extensionsRoutes = require('../modules/extensions/extensions.routes');
const accountsRoutes = require('../modules/accounts/accounts.routes');

// Health check — verifies DB connectivity before returning 200
router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.1.0' });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/requests', requestsRoutes);
router.use('/jobs', jobsRoutes);
router.use('/safety', safetyRoutes);
router.use('/purchasing', purchasingRoutes);
router.use('/activity', activityRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/field-reports', fieldReportsRoutes);
router.use('/vendors', vendorsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/extensions', extensionsRoutes);
router.use('/accounts', accountsRoutes);

module.exports = router;
