/* eslint-disable node/no-process-env */
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { ProfilingIntegration } from '@sentry/profiling-node'

import { prisma } from '@weareinreach/db'

const isVercelProd = process.env.VERCEL_ENV === 'production'

Sentry.init({
	dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.sentry.io/6751163',

	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: isVercelProd ? 0.5 : 1.0,
	profilesSampleRate: isVercelProd ? 0.5 : 1.0,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: !!process.env.SENTRY_DEBUG,
	instrumenter: 'otel',
	integrations: [
		new Sentry.Integrations.RequestData(),
		new Sentry.Integrations.Prisma({ client: prisma }),
		new ProfilingIntegration(),
	],
})
