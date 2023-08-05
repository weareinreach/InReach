/* eslint-disable node/no-process-env */
import { type Prisma, PrismaClient } from '@prisma/client'
import { createPrismaQueryEventHandler } from 'prisma-query-log'

import { createLoggerInstance } from '@weareinreach/util/logger'
import { idMiddleware } from '~db/lib/idMiddleware'
import { superjsonMiddleware } from '~db/lib/superjsonMiddleware'

const log = createLoggerInstance('prisma')
const verboseLogging = Boolean(
	// eslint-disable-next-line turbo/no-undeclared-env-vars
	process.env.NODE_ENV === 'development' && (!!process.env.NEXT_VERBOSE || !!process.env.PRISMA_VERBOSE)
)

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
	errorFormat: 'pretty',
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
prisma.$connect()
if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
export { prisma }
export type * from '@prisma/client'
export { Prisma } from '@prisma/client'
