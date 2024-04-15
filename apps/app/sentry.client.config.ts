/* eslint-disable node/no-process-env */
// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import {
	captureConsoleIntegration,
	extraErrorDataIntegration,
	reportingObserverIntegration,
} from '@sentry/integrations'
import * as Sentry from '@sentry/nextjs'

const isVercelProd = process.env.VERCEL_ENV === 'production'
Sentry.init({
	dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.us.sentry.io/6751163',
	enabled: isVercelProd,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: !!process.env.SENTRY_DEBUG,

	// Set sample rates
	replaysOnErrorSampleRate: 1.0,
	replaysSessionSampleRate: 0.1,
	tracesSampleRate: 0.5,
	profilesSampleRate: 0.5,

	// You can remove this option if you're not planning to use the Sentry Session Replay feature:
	integrations: [
		Sentry.replayIntegration({
			// Additional Replay configuration goes in here, for example:
			maskAllText: true,
			blockAllMedia: true,
		}),
		Sentry.browserTracingIntegration({ enableInp: true }),
		Sentry.browserProfilingIntegration(),
		reportingObserverIntegration(),
		captureConsoleIntegration(),
		extraErrorDataIntegration(),
	],
	ignoreErrors: [
		/^ResizeObserver loop completed with undelivered notifications.$/,
		/^ResizeObserver loop limit exceeded$/,
	],
	tracePropagationTargets: ['localhost', /^https:\/\/(?:[a-z0-9-]+)-weareinreach\.vercel\.app\/.*/i],
})
