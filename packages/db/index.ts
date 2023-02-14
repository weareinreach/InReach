/* eslint-disable node/no-process-env */
import { createId } from '@paralleldrive/cuid2'
import { PrismaClient } from '@prisma/client'

declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

export const prisma =
	global.prisma ||
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	})

export * from './client'
export * from './zod_util'

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}

export { createId }
