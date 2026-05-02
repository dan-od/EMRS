const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const config = require('../../config/env');
const { AppError } = require('../../middleware');
const {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashResetToken,
  sendPasswordReset
} = require('../../utils');

// NOTE: Activity logging is handled in auth.controller.js
// Do NOT log here to avoid duplicate entries

const login = async (email, password, ipAddress) => {
  const result = await query(
    `SELECT id, email, password_hash, first_name, last_name,
            role, department, is_active, must_change_password
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new AppError('ACCOUNT_SUSPENDED', 403);
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  const token = generateAccessToken(user.id, { role: user.role, department: user.department });
  const { token: refreshToken } = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      department: user.department,
      mustChangePassword: user.must_change_password
    },
    token,
    refreshToken
  };
};

const refresh = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch (e) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (decoded.type !== 'refresh') {
    throw new AppError('Invalid token type', 401);
  }

  // Check denylist
  if (decoded.jti) {
    const denied = await query(
      'SELECT 1 FROM token_denylist WHERE jti = $1',
      [decoded.jti]
    );
    if (denied.rows.length > 0) {
      throw new AppError('Refresh token has been revoked. Please log in again.', 401);
    }
  }

  // Verify user still active, fetch role/department for new token payload
  const result = await query(
    'SELECT id, role, department, is_active FROM users WHERE id = $1',
    [decoded.userId]
  );
  if (!result.rows[0] || !result.rows[0].is_active) {
    throw new AppError('User not found or deactivated', 401);
  }

  // Revoke old refresh token (rotation)
  if (decoded.jti && decoded.exp) {
    await query(
      'INSERT INTO token_denylist (jti, expires_at) VALUES ($1, to_timestamp($2)) ON CONFLICT DO NOTHING',
      [decoded.jti, decoded.exp]
    );
  }

  const { role, department } = result.rows[0];
  const newAccessToken = generateAccessToken(decoded.userId, { role, department });
  const { token: newRefreshToken } = generateRefreshToken(decoded.userId);

  return { token: newAccessToken, refreshToken: newRefreshToken };
};

const getMe = async (userId) => {
  const result = await query(
    `SELECT id, email, first_name, last_name, role, department,
            phone, employee_id, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    department: user.department,
    phone: user.phone,
    employeeId: user.employee_id,
    createdAt: user.created_at
  };
};

const forgotPassword = async (email) => {
  const result = await query(
    'SELECT id, email, first_name FROM users WHERE email = $1 AND is_active = true',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return { message: 'If email exists, reset instructions sent.' };
  }

  const user = result.rows[0];
  const { token, hash, expires } = generateResetToken();

  await query(
    'UPDATE users SET reset_token_hash = $1, reset_token_expires = $2 WHERE id = $3',
    [hash, expires, user.id]
  );

  await sendPasswordReset(user.email, token, user.first_name);

  return { message: 'If email exists, reset instructions sent.' };
};

const resetPassword = async (token, newPassword) => {
  const hash = hashResetToken(token);

  const result = await query(
    `SELECT id FROM users
     WHERE reset_token_hash = $1
     AND reset_token_expires > CURRENT_TIMESTAMP
     AND is_active = true`,
    [hash]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const userId = result.rows[0].id;
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await query(
    `UPDATE users
     SET password_hash = $1,
         reset_token_hash = NULL,
         reset_token_expires = NULL,
         must_change_password = false
     WHERE id = $2`,
    [passwordHash, userId]
  );

  return { message: 'Password reset successfully' };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const result = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await query(
    'UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2',
    [passwordHash, userId]
  );

  const userResult = await query('SELECT role, department FROM users WHERE id = $1', [userId]);
  const { role, department } = userResult.rows[0] || {};
  const token = generateAccessToken(userId, { role, department });

  return { message: 'Password changed successfully', token };
};

module.exports = { login, refresh, getMe, forgotPassword, resetPassword, changePassword };
