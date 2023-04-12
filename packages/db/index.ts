/* eslint-disable import/first */
/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */

// if (process.env.NODE_ENV === 'development') require('./otel')

import { PrismaClient, Prisma } from '@prisma/client'
import { createPrismaQueryEventHandler } from 'prisma-query-log'
import { Logger } from 'tslog'

import { idMiddleware } from './lib/idMiddleware'
import { superjsonMiddleware } from './lib/superjsonMiddleware'

const log = new Logger({ name: 'prisma' })
const verboseLogging = Boolean(process.env.NODE_ENV === 'development' && !!process.env.NEXT_VERBOSE)
declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var prisma: PrismaClient<typeof clientOptions> | undefined
}

const clientOptions = {
	log: verboseLogging
		? [
				{ level: 'query', emit: 'event' },
				{ level: 'error', emit: 'stdout' },
				{ level: 'warn', emit: 'stdout' },
		  ]
		: [
				{ level: 'error', emit: 'event' },
				{ level: 'warn', emit: 'event' },
		  ],
} satisfies Prisma.PrismaClientOptions

const prisma = global.prisma || new PrismaClient(clientOptions)

prisma.$use(idMiddleware)
prisma.$use(superjsonMiddleware)

const queryLogger = createPrismaQueryEventHandler({
	queryDuration: true,
	format: true,
	indent: `\t`,
	// linesBetweenQueries: 2,
	language: 'pl/sql',
	logger: (data) => log.info(`\n${data}`),
})

if (!global.prisma) {
	if (verboseLogging) {
		prisma.$on('query', queryLogger)
	} else {
		prisma.$on('error', (event) => log.error(event))
		prisma.$on('warn', (event) => log.warn(event))
	}
}

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}

export * from '@prisma/client'
export * from './zod_util'

export { slug } from './lib/slugGen'
export { createPoint } from './lib/createPoint'
export { generateFreeText } from './lib/generateFreeText'
export { generateId } from './lib/idGen'
export { PrismaInstrumentation } from '@prisma/instrumentation'
export { prisma }
