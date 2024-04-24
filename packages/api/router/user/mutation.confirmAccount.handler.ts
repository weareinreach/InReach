import { confirmAccount as cognitoConfirmAccount } from '@weareinreach/auth/confirmAccount'
import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TConfirmAccountSchema } from './mutation.confirmAccount.schema'

const confirmAccount = async ({ input }: TRPCHandlerParams<TConfirmAccountSchema>) => {
	const { code, email } = input
	const response = await cognitoConfirmAccount(email, code)

	const { id } = await prisma.user.findFirstOrThrow({
		where: {
			email: {
				equals: email.toLowerCase(),
				mode: 'insensitive',
			},
		},
		select: {
			id: true,
		},
	})

	await prisma.user.update({
		where: {
			id,
		},
		data: {
			emailVerified: new Date(),
		},
	})
	return response
}
export default confirmAccount
