const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');

const generateAccessToken = (userId, { role, department } = {}) => {
  const jti = crypto.randomUUID();
  return jwt.sign(
    { userId, jti, role, department },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const generateRefreshToken = (userId) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { userId, jti, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
  return { token, jti };
};

const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, hash, expires };
};

const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashResetToken,
  generateTempPassword,
  generateId
};
