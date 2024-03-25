import { TRPCError } from '@trpc/server'

import { deleteAccount as cognitoDeleteAccount } from '@weareinreach/auth/deleteAccount'
import { userLogin } from '@weareinreach/auth/userLogin'
import { userSignOut } from '@weareinreach/auth/userLogout'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteAccountSchema } from './mutation.deleteAccount.schema'

export const deleteAccount = async ({ ctx, input }: TRPCHandlerParams<TDeleteAccountSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const email = ctx.session.user.email.toLowerCase()
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
export default deleteAccount
