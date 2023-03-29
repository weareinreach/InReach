/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { PrismaClient, Prisma } from '@prisma/client'
import { createPrismaQueryEventHandler } from 'prisma-query-log'
import { Logger } from 'tslog'

import { generateId } from './lib/idGen'
import { idMiddleware } from './lib/idMiddleware'
import { superjsonMiddleware } from './lib/superjsonMiddleware'

const log = new Logger({ name: 'prisma', type: 'json' })
declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var prisma: PrismaClient<typeof clientOptions> | undefined
}

const clientOptions = {
	log:
		process.env.NODE_ENV === 'development' && !!process.env.NEXT_VERBOSE
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
	indent: undefined,
	linesBetweenQueries: 2,
})

if (!global.prisma) {
	prisma.$on('query', queryLogger)
	prisma.$on('error', log.error)
	prisma.$on('warn', log.warn)
}

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}

export * from '@prisma/client'
export * from './zod_util'

export { slug } from './lib/slugGen'
export { createPoint } from './lib/createPoint'
export { prisma, generateId }
