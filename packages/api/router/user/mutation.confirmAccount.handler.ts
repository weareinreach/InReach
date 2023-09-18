import { confirmAccount as cognitoConfirmAccount } from '@weareinreach/auth/lib/confirmAccount'
import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TConfirmAccountSchema } from './mutation.confirmAccount.schema'

export const confirmAccount = async ({ input }: TRPCHandlerParams<TConfirmAccountSchema>) => {
	const { code, email } = input
	const response = await cognitoConfirmAccount(email, code)

	await prisma.user.update({
		where: {
			email,
		},
		data: {
			emailVerified: new Date(),
		},
	})
	return response
}
