let Sentry = null;
try { Sentry = require('@sentry/node'); } catch (e) {}

const init = (dsn) => {
  if (!dsn || !Sentry) return;
  Sentry.init({ dsn, tracesSampleRate: 0.1, environment: process.env.NODE_ENV || 'development' });
};

const captureException = (err) => {
  if (Sentry && err) Sentry.captureException(err);
};

module.exports = { init, captureException };
