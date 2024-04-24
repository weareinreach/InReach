import { TRPCError } from '@trpc/server'

import { createCognitoUser } from '@weareinreach/auth/createUser'
import { getAuditedClient, Prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

export const create = async ({ input }: TRPCHandlerParams<TCreateSchema>) => {
	const prisma = getAuditedClient(input.prisma.data.id)
	try {
		const newUser = await prisma.$transaction(async (tx) => {
			const user = await tx.user.create(input.prisma)
			if (user.id !== input.cognito.databaseId) {
				throw new Error('Database ID mismatch')
			}
			const cognitoUser = await createCognitoUser(input.cognito)
			if (cognitoUser?.prismaAccount) {
				await tx.account.create(cognitoUser.prismaAccount)
			}

			if (user.id && cognitoUser?.cognitoId) {
				return { success: true }
			}
			throw new Error('Could not create user')
		})
		return newUser
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' })
		}
		throw error
	}
}
export default create
