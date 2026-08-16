/* eslint-disable node/no-process-env */
import * as Sentry from '@sentry/nextjs'

const isVercel = process.env.VERCEL === '1'
export function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		Sentry.init({
			dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.us.sentry.io/6751163',
			// Your Node.js Sentry configuration...
			enabled: isVercel,
			debug: !!process.env.SENTRY_DEBUG,
			// Tracing rates
			tracesSampleRate: 0.5,
			profilesSampleRate: 0.5,
			// uncomment the line below to enable Spotlight (https://spotlightjs.com)
			spotlight: process.env.NODE_ENV === 'development',
			// prismaIntegration() removed: its OTel instrumentation patches PrismaClient at
			// require-time regardless of `enabled`, and Sentry 8's version of it calls a Prisma 6
			// tracing-helper method (dispatchEngineSpans) that no longer exists, breaking every
			// query. Re-add once @sentry/nextjs is upgraded to a Prisma-6-compatible version.
			integrations: [Sentry.requestDataIntegration()],
		})
	}

	// This is your Sentry.init call from `sentry.edge.config.js|ts`
	if (process.env.NEXT_RUNTIME === 'edge') {
		Sentry.init({
			dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.us.sentry.io/6751163',
			// Your Edge Runtime Sentry configuration...
			enabled: isVercel,
			// Adjust this value in production, or use tracesSampler for greater control
			tracesSampleRate: 0.5,

			// Setting this option to true will print useful information to the console while you're setting up Sentry.
			debug: !!process.env.SENTRY_DEBUG,
		})
	}
}
