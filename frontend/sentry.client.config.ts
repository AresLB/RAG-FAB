import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay (optional, uses quota)
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Mask text for privacy
      blockAllMedia: true, // Block images/videos
    }),
  ],

  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove user email
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'canvas.contentDocument',
    // Network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
  ],
});
