import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isValidDsn = Boolean(dsn && !dsn.includes('your-key') && dsn.startsWith('https://'));

Sentry.init({
  dsn: isValidDsn ? dsn : undefined,
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === 'production' && isValidDsn,
});
