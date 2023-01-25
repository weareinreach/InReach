import { prisma, Prisma, type User } from './client'
import { logger } from './logger'

type GetUser = (email: string) => Promise<User>

export const getUser: GetUser = async (email) => {
	try {
		return await prisma.user.findUniqueOrThrow({
			where: {
				email,
			},
		})
	} catch (error) {
		if (error instanceof Prisma.NotFoundError) {
			logger.error(`User not found: ${email}`)
			throw new Error(`User not found`)
		}
		throw error
	}
}
