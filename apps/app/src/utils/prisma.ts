import { PrismaClient } from '@weareinreach/db'

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

const generateClient = () =>
	new PrismaClient({
		log: [
			{
				emit: 'event',
				level: 'query',
			},
		],
	})

export const prisma = global.prisma || generateClient()
if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
