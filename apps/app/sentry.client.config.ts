// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

// Sentry.init({
Sentry.init({
	dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.sentry.io/6751163',
	integrations: [
		new Sentry.Replay({
			// Additional Replay configuration goes in here, for example:
			maskAllText: true,
			blockAllMedia: true,
		}),
		new Sentry.BrowserTracing(),
		new Sentry.BrowserProfilingIntegration(),
	],
	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 1,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,

	replaysOnErrorSampleRate: 1.0,

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: 0.1,
	profilesSampleRate: 1,

	tracePropagationTargets: [
		/^https?:\/\/app\.inreach\.org(?:\/.*)?/i,
		/^https?:\/\/.*-weareinreach\.vercel\.app(?:\/.*)?/i,
		/^https?:\/\/localhost(?::\d+)?(?:\/.*)?/i,
		/^\//i,
	],
	ignoreErrors: [
		/^ResizeObserver loop completed with undelivered notifications.$/,
		/^ResizeObserver loop limit exceeded$/,
	],
})
