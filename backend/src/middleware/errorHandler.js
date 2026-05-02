const config = require('../config/env');
const logger = require('../utils/logger');
const { captureException } = require('../utils/sentry');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  // PostgreSQL errors
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate entry. This record already exists.';
  }
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference. Related record not found.';
  }
  if (err.code === '22P02') {
    statusCode = 400;
    message = 'Invalid input syntax.';
  }

  // DB connectivity / pool exhaustion errors — return 503 so load balancers can retry
  if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'ETIMEDOUT' ||
    err.code === '57P03' || // PostgreSQL: cannot_connect_now
    (err.message && err.message.includes('timeout exceeded when trying to connect'))
  ) {
    statusCode = 503;
    message = 'Service temporarily unavailable. Please try again.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }

  if (config.nodeEnv === 'development') {
    logger.error('❌ Error', { message: err.message, stack: err.stack });
  }

  if (statusCode >= 500) captureException(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const error = new AppError(`Not found: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = { AppError, errorHandler, notFound };
