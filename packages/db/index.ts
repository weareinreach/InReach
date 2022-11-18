/* eslint-disable turbo/no-undeclared-env-vars */
// src/server/db/client.ts
import { PrismaClient } from '@prisma/client'

// import { queryHandler } from 'prisma-query-inspector'

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

const generateClient = () =>
	process.env.SEED
		? new PrismaClient()
		: new PrismaClient({
				log: [
					{
						emit: 'event',
						level: 'query',
					},
				],
		  })

export const prisma = global.prisma || generateClient()
if (!process.env.SEED) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	// prisma.$on('query', queryHandler)
}
if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
