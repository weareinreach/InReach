/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { createId } from '@paralleldrive/cuid2'
import { PrismaClient, Prisma } from '@prisma/client'
import { createPrismaQueryEventHandler } from 'prisma-query-log'

import { generateId } from './lib/idGen'

import { idMiddleware } from '~db/lib/idMiddleware'

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
			: ['error'],
} satisfies Prisma.PrismaClientOptions

const prisma = global.prisma || new PrismaClient(clientOptions)

prisma.$use(idMiddleware)

const log = createPrismaQueryEventHandler({
	queryDuration: true,
	format: true,
	indent: undefined,
	linesBetweenQueries: 2,
})

if (!global.prisma) {
	prisma.$on('query', log)
}

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}

export * from '@prisma/client'
export * from './zod_util'

export { slug } from './lib/slugGen'
export { createId, prisma, generateId }
