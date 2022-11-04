import * as Sentry from '@sentry/nextjs'

import { env } from './src/env/client.mjs'

const WEB_SENTRY_DSN: string = env.NEXT_PUBLIC_WEB_SENTRY_DSN

Sentry.init({
	dsn: WEB_SENTRY_DSN,
	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0,
	// ...
	// Note: if you want to override the automatic release value, do not set a
	// `release` value here - use the environment variable `SENTRY_RELEASE`, so
	// that it will also get attached to your source maps
})
