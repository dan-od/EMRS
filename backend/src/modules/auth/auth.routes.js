const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate, validate, authLimiter, passwordResetLimiter } = require('../../middleware');
const {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} = require('./auth.validation');

// Public routes
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Token refresh (public — uses its own refresh token verification)
router.post('/refresh', authController.refresh);

// Protected routes
router.get(
  '/me',
  authenticate,
  authController.getMe
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

module.exports = router;
