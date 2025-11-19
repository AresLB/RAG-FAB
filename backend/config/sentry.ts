import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from './env';

export function initializeSentry() {
  if (!env.SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Profiling (requires Sentry plan)
    profilesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Release Tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove sensitive data from context
      if (event.contexts?.user) {
        delete event.contexts.user.email;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Facebook
      'fb_xd_fragment',
      // Network errors
      'Network request failed',
      'NetworkError',
    ],
  });

  console.log('✅ Sentry initialized for', env.NODE_ENV);
}

// Custom Express middleware for Sentry v8 (replaces Handlers.requestHandler)
export function sentryRequestMiddleware(req: any, res: any, next: any) {
  // Add request context to Sentry scope
  Sentry.setContext('request', {
    url: req.url,
    method: req.method,
    headers: {
      'user-agent': req.headers['user-agent'],
    },
  });

  // Set user context if available
  if (req.user) {
    Sentry.setUser({
      id: req.user.userId,
      // Don't include email for privacy
    });
  }

  next();
}

// Custom Express error handler for Sentry v8 (replaces Handlers.errorHandler)
export function sentryErrorMiddleware(err: any, req: any, res: any, next: any) {
  // Capture exception in Sentry
  Sentry.captureException(err, {
    contexts: {
      request: {
        url: req.url,
        method: req.method,
        query: req.query,
        body: req.body,
      },
    },
  });

  // Pass to next error handler
  next(err);
}

export { Sentry };
