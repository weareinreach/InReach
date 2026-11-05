import { TRPCError } from '@trpc/server'

import { deleteAccount as cognitoDeleteAccount } from '@weareinreach/auth/deleteAccount'
import { userLogin } from '@weareinreach/auth/userLogin'
import { userSignOut } from '@weareinreach/auth/userLogout'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDeleteAccountSchema } from './mutation.deleteAccount.schema'

const deleteAccount = async ({ ctx, input }: TRPCHandlerParams<TDeleteAccountSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const email = ctx.session.user.email.toLowerCase()
	const cognitoSession = await userLogin(email, input)
	if (cognitoSession.success) {
		const successful = await prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { email },
				data: { active: false },
			})
			// userSignOut looks up the user_access_token view by the real user id, not by email - passing
			// email here meant the lookup never matched anything, this threw every time, and account
			// deletion failed for every user regardless of credentials. ctx.actorId is the real id (same
			// value this exact function is called with correctly elsewhere, e.g. auth-options.ts's signOut
			// callback).
			await userSignOut(ctx.actorId)
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
