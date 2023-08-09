import { TRPCError } from '@trpc/server'

import { deleteAccount as cognitoDeleteAccount } from '@weareinreach/auth/lib/deleteAccount'
import { userLogin } from '@weareinreach/auth/lib/userLogin'
import { userSignOut } from '@weareinreach/auth/lib/userLogout'
import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteAccountSchema } from './mutation.deleteAccount.schema'

export const deleteAccount = async ({ ctx, input }: TRPCHandlerParams<TDeleteAccountSchema, 'protected'>) => {
	const { email } = ctx.session.user
	const cognitoSession = await userLogin(email, input)
	if (cognitoSession.success) {
		const successful = await prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { email },
				data: { active: false },
			})
			await userSignOut(email)
			await cognitoDeleteAccount(email)
			return true
		})
		if (successful) {
			return true
		}
	}
	throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Incorrect credentials' })
}
