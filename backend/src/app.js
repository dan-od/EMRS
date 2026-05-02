const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { init: initSentry } = require('./utils/sentry');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

initSentry(config.sentryDsn);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", config.frontendUrl],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression — skip API routes (BREACH mitigation)
app.use(compression({
  filter: (req) => !req.path.startsWith('/api')
}));

// Rate limiting
app.use('/api', apiLimiter);

// Pagination guard — prevent unbounded queries
app.use((req, res, next) => {
  const limit = req.query.limit !== undefined ? Number(req.query.limit) : null;
  if (limit !== null && (isNaN(limit) || limit > 100)) {
    return res.status(400).json({ success: false, message: 'limit must be between 1 and 100' });
  }
  next();
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
