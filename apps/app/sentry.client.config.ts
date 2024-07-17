/* eslint-disable node/no-process-env */
import * as Sentry from '@sentry/nextjs'

const isVercel = process.env.VERCEL === '1'
Sentry.init({
	dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.us.sentry.io/6751163',
	enabled: isVercel,

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
		Sentry.reportingObserverIntegration(),
		Sentry.captureConsoleIntegration(),
		Sentry.extraErrorDataIntegration(),
	],
	ignoreErrors: [
		/^ResizeObserver loop completed with undelivered notifications.$/,
		/^ResizeObserver loop limit exceeded$/,
	],
})
