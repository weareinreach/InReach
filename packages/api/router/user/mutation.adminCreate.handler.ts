import { type z } from 'zod'

import { createCognitoUser } from '@weareinreach/auth/lib/createUser'
import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAdminCreateSchema, ZAdminCreateSchema } from './mutation.adminCreate.schema'

export const adminCreate = async ({ ctx, input }: TRPCHandlerParams<TAdminCreateSchema, 'protected'>) => {
	const inputData = {
		actorId: ctx.session.user.id,
		operation: 'CREATE',
		data: input,
	} satisfies z.input<ReturnType<typeof ZAdminCreateSchema>['dataParser']>

	const recordData = ZAdminCreateSchema().dataParser.parse(inputData)
	const newUser = await prisma.$transaction(async (tx) => {
		const user = await tx.user.create(recordData.prisma)
		const cognitoUser = await createCognitoUser(recordData.cognito)
		return {
			user,
			cognitoUser,
		}
	})
	return newUser
}
