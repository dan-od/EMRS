const jwt = require('jsonwebtoken');
const authService = require('./auth.service');
const config = require('../../config/env');
const { query } = require('../../config/db');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

// Cookie maxAge in ms — must match JWT_EXPIRES_IN (default 1h)
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 1000;

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_COOKIE_MAX_AGE,
    path: '/',
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await authService.login(email, password, ipAddress);

    // Log successful login
    await logActivity({
      userId: result.user.id,
      userEmail: result.user.email,
      userRole: result.user.role,
      action: ACTIONS.LOGIN,
      entityType: ENTITY_TYPES.USER,
      entityId: result.user.id,
      entityName: `${result.user.first_name} ${result.user.last_name}`,
      department: result.user.department,
      details: { ip: ipAddress },
      req
    });

    setAuthCookie(res, result.token);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // Log failed login attempt
    if (req.validatedBody?.email) {
      await logActivity({
        userId: null,
        userEmail: req.validatedBody.email,
        action: ACTIONS.LOGIN_FAILED,
        entityType: ENTITY_TYPES.USER,
        details: { reason: error.message, ip: req.ip },
        req
      });
    }
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validatedBody;
    const result = await authService.forgotPassword(email);

    await logActivity({
      userEmail: email,
      action: ACTIONS.PASSWORD_RESET_REQUESTED,
      entityType: ENTITY_TYPES.USER,
      details: { email },
      req
    });

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.validatedBody;
    const result = await authService.resetPassword(token, password);

    await logActivity({
      action: ACTIONS.PASSWORD_RESET_COMPLETED,
      entityType: ENTITY_TYPES.USER,
      details: { tokenUsed: true },
      req
    });

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;
    const result = await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.PASSWORD_CHANGED,
      entityType: ENTITY_TYPES.USER,
      entityId: req.user.id,
      department: req.user.department,
      req
    });

    res.json({
      success: true,
      data: { token: result.token, message: result.message }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Denylist the access token
    if (req.tokenPayload?.jti && req.tokenPayload?.exp) {
      await query(
        'INSERT INTO token_denylist (jti, expires_at) VALUES ($1, to_timestamp($2)) ON CONFLICT DO NOTHING',
        [req.tokenPayload.jti, req.tokenPayload.exp]
      );
    }

    // Denylist the refresh token if provided
    const refreshToken = req.body?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.decode(refreshToken);
        if (decoded?.jti && decoded?.exp) {
          await query(
            'INSERT INTO token_denylist (jti, expires_at) VALUES ($1, to_timestamp($2)) ON CONFLICT DO NOTHING',
            [decoded.jti, decoded.exp]
          );
        }
      } catch (e) { /* malformed refresh token — ignore */ }
    }

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.LOGOUT,
      entityType: ENTITY_TYPES.USER,
      entityId: req.user.id,
      department: req.user.department,
      req
    });

    res.clearCookie('token', { path: '/' });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    const result = await authService.refresh(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe, forgotPassword, resetPassword, changePassword, logout, refresh };
