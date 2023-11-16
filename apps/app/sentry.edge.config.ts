/* eslint-disable node/no-process-env */
// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isVercelProd = process.env.VERCEL_ENV === 'production'
Sentry.init({
	dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.sentry.io/6751163',

	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: isVercelProd ? 0.5 : 1.0,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: !!process.env.SENTRY_DEBUG,
})
