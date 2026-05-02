const DSN = import.meta.env.VITE_SENTRY_DSN;
let _capture = null;

export const initSentry = () => {
  if (!DSN) return;
  import('@sentry/react')
    .then(S => { S.init({ dsn: DSN, tracesSampleRate: 0.1 }); _capture = S.captureException.bind(S); })
    .catch(() => {});
};

export const captureException = (err) => _capture?.(err);
