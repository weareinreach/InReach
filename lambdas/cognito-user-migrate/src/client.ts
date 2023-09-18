// import { PrismaClient } from '@prisma/client'

// import { logger } from './logger'

// export const prisma = new PrismaClient({
// 	log: [
// 		{
// 			emit: 'event',
// 			level: 'query',
// 		},
// 		{
// 			emit: 'event',
// 			level: 'error',
// 		},
// 		{
// 			emit: 'event',
// 			level: 'info',
// 		},
// 		{
// 			emit: 'event',
// 			level: 'warn',
// 		},
// 	],
// })
// prisma.$on('query', (e) => logger.info({ message: JSON.stringify(e) }))
// prisma.$on('info', (e) => logger.info({ message: JSON.stringify(e) }))
// prisma.$on('error', (e) => logger.error({ message: JSON.stringify(e) }))
// prisma.$on('warn', (e) => logger.warn({ message: JSON.stringify(e) }))

// export * from '@prisma/client'
// import { prisma } from '@weareinreach/db'

// export { prisma }
export {}
