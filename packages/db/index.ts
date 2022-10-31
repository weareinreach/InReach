// src/server/db/client.ts
import { PrismaClient } from '@prisma/client'
import { queryHandler } from 'prisma-query-inspector'

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

export const prisma =
	global.prisma ||
	new PrismaClient({
		log:
			// env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
			[
				{
					emit: 'event',
					level: 'query',
				},
			],
	})
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
prisma.$on('query', queryHandler)
if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
