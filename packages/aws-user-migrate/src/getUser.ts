import { prisma } from '@weareinreach/db'
import { Prisma, type User } from '@weareinreach/db/prisma'

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
			console.error(`User not found`)
			throw new Error(`User not found`)
		}
		throw error
	}
}
