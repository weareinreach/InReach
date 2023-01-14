/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from './client'

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

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
