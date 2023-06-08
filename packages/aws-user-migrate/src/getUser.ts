import { prisma, Prisma, type User } from '@weareinreach/db'

import { logger } from './logger'

type GetUser = (email: string) => Promise<User>

export const getUser: GetUser = async (email) => {
	try {
		// eslint-disable-next-line @typescript-eslint/return-await
		return await prisma.user.findUniqueOrThrow({
			where: {
				email,
			},
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
			logger.error(`User not found: ${email}`)
			throw new Error(`User not found`)
		}
		throw error
	}
}
