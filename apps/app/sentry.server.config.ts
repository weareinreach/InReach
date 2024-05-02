/* eslint-disable node/no-process-env */
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

import { prisma } from '@weareinreach/db'

const isVercel = process.env.VERCEL === '1'

Sentry.init({
	dsn: 'https://3398c2248c86498ab42fa8533e4f83f1@o1412293.ingest.us.sentry.io/6751163',
	enabled: isVercel,
	debug: !!process.env.SENTRY_DEBUG,
	// Tracing rates
	tracesSampleRate: 0.5,
	profilesSampleRate: 0.5,
	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	spotlight: process.env.NODE_ENV === 'development',

	integrations: [
		new Sentry.Integrations.RequestData(),
		new Sentry.Integrations.Prisma({ client: prisma }),
		nodeProfilingIntegration(),
	],
})
