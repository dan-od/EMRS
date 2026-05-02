const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { query } = require('../config/db');
const { AppError } = require('./errorHandler');

const authenticate = async (req, res, next) => {
  try {
    // Cookie takes precedence (httpOnly, XSS-safe); fall back to Bearer header for API clients
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization;

    let token;
    if (cookieToken) {
      token = cookieToken;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      throw new AppError('No token provided. Please log in.', 401);
    }
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check token denylist (server-side logout invalidation)
    if (decoded.jti) {
      const denied = await query(
        'SELECT 1 FROM token_denylist WHERE jti = $1',
        [decoded.jti]
      );
      if (denied.rows.length > 0) {
        throw new AppError('Token has been revoked. Please log in again.', 401);
      }
    }

    // Check user is still active (role/department come from JWT claims)
    const result = await query(
      'SELECT id, email, first_name, last_name, role, department, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found.', 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new AppError('Account is deactivated. Contact admin.', 401);
    }

    req.user = user;
    req.tokenPayload = decoded; // carries jti + exp for logout denylist
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token present — continue as unauthenticated
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Token present but invalid/expired — return 401 rather than silently ignoring
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const result = await query(
      `SELECT id, email, first_name, last_name, role, department, is_active
       FROM users WHERE id = $1 AND is_active = true`,
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
      req.tokenPayload = decoded;
    }
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token.', 401));
  }
};

module.exports = { authenticate, optionalAuth };
