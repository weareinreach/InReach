/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client'
import { env } from '@weareinreach/config'

declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

export const prisma =
	global.prisma ||
	new PrismaClient({
		log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	})

export * from './client'

if (env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
