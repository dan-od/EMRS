const app = require('./src/app');
const config = require('./src/config/env');
const { pool } = require('./src/config/db');
const { startScheduler, stopScheduler } = require('./src/scheduler');
const logger = require('./src/utils/logger');

let server;

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('Database connection verified');

    // Store server reference for graceful shutdown
    server = app.listen(config.port, () => {
      logger.info(`EMRS API Server running on port ${config.port}`, { env: config.nodeEnv, frontendUrl: config.frontendUrl });
    });
    server.setTimeout(30000);

    startScheduler();
  } catch (error) {
    logger.error('Failed to start server', { message: error.message });
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  stopScheduler();
  if (server) {
    // Stop accepting new connections; wait for in-flight requests to finish
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    // Force exit after 10s if requests don't drain
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  } else {
    await pool.end();
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled async errors — Node 15+ exits without these
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { message: reason?.message || String(reason) });
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message });
  shutdown('uncaughtException');
});

startServer();
