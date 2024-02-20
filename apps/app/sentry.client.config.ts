/* eslint-disable node/no-process-env */
// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isVercelProd = process.env.VERCEL_ENV === 'production'
Sentry.init({
	dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.sentry.io/6751163',
	integrations: [
		Sentry.replayIntegration({
			// Additional Replay configuration goes in here, for example:
			maskAllText: true,
			blockAllMedia: true,
		}),
		Sentry.browserTracingIntegration(),
		Sentry.browserProfilingIntegration(),
	],
	enabled: isVercelProd,
	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: isVercelProd ? 0.5 : 1.0,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: !!process.env.SENTRY_DEBUG,

	replaysOnErrorSampleRate: 1.0,

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: isVercelProd ? 0.1 : 1.0,
	profilesSampleRate: isVercelProd ? 0.5 : 1.0,

	// tracePropagationTargets: [
	// 	/^https?:\/\/app\.inreach\.org(?:\/.*)?/i,
	// 	/^https?:\/\/.*-weareinreach\.vercel\.app(?:\/.*)?/i,
	// 	/^https?:\/\/localhost(?::\d+)?(?:\/.*)?/i,
	// 	/^\//i,
	// ],
	ignoreErrors: [
		/^ResizeObserver loop completed with undelivered notifications.$/,
		/^ResizeObserver loop limit exceeded$/,
	],
})
