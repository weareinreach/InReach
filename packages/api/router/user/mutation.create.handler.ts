import { TRPCError } from '@trpc/server'

import { createCognitoUser } from '@weareinreach/auth/lib/createUser'
import { Prisma, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

export const create = async ({ input }: TRPCHandlerParams<TCreateSchema>) => {
	try {
		const newUser = await prisma.$transaction(async (tx) => {
			const user = await tx.user.create(input.prisma)
			if (user.id !== input.cognito.databaseId) throw new Error('Database ID mismatch')
			const cognitoUser = await createCognitoUser(input.cognito)
			if (cognitoUser?.prismaAccount) await tx.account.create(cognitoUser.prismaAccount)

			if (user.id && cognitoUser?.cognitoId) return { success: true }
		})
		return newUser
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' })
		}
		handleError(error)
	}
}
