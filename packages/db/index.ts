/* eslint-disable node/no-process-env */
import { createId } from '@paralleldrive/cuid2'
import { PrismaClient, Prisma } from '@prisma/client'
import { queryHandler } from 'prisma-query-inspector'
import { createPrismaQueryEventHandler } from 'prisma-query-log'

declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var prisma: PrismaClient<typeof clientOptions> | undefined
}

const clientOptions = {
	log:
		process.env.NODE_ENV === 'development'
			? [
					{ level: 'query', emit: 'event' },
					{ level: 'error', emit: 'stdout' },
					{ level: 'warn', emit: 'stdout' },
			  ]
			: ['error'],
} satisfies Prisma.PrismaClientOptions

export const prisma = global.prisma || new PrismaClient(clientOptions)

const log = createPrismaQueryEventHandler({
	queryDuration: true,
	format: true,
	indent: undefined,
	linesBetweenQueries: 2,
})
prisma.$on('query', log)

prisma.$on('query', queryHandler)

export * from './client'
export * from './zod_util'

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}

export { createId }
