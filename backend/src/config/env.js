require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'emrs_db',
    user: process.env.DB_USER || 'postgres',
    password: (() => {
      if (process.env.DB_PASSWORD) return process.env.DB_PASSWORD;
      if ((process.env.NODE_ENV || 'development') === 'development') return 'password';
      throw new Error('DB_PASSWORD environment variable is required in production');
    })(),
  },
  
  // JWT
  jwt: {
    secret: (() => {
      if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
      if ((process.env.NODE_ENV || 'development') === 'development') return 'dev-only-jwt-secret-do-not-use-in-prod';
      throw new Error('JWT_SECRET environment variable is required in production');
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: (() => {
      if (process.env.JWT_REFRESH_SECRET) return process.env.JWT_REFRESH_SECRET;
      if ((process.env.NODE_ENV || 'development') === 'development') return 'dev-only-refresh-secret-do-not-use-in-prod';
      throw new Error('JWT_REFRESH_SECRET environment variable is required in production');
    })(),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Error tracking
  sentryDsn: process.env.SENTRY_DSN || null,
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@wellfluid.com',
  },
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // File uploads
  uploads: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  
  // SMS (Termii)
  sms: {
    enabled: process.env.SMS_ENABLED === 'true',
    apiKey: process.env.TERMII_API_KEY,
    senderId: process.env.TERMII_SENDER_ID || 'WellFluid',
  }
};
