import { createCognitoUser } from '@weareinreach/auth/createUser'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAdminCreateSchema } from './mutation.adminCreate.schema'

const adminCreate = async ({ ctx, input }: TRPCHandlerParams<TAdminCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const newUser = await prisma.$transaction(async (tx) => {
		const user = await tx.user.create(input.prisma)
		const cognitoUser = await createCognitoUser(input.cognito)
		return {
			user,
			cognitoUser,
		}
	})
	return newUser
}
export default adminCreate
