import { confirmAccount as cognitoConfirmAccount } from '@weareinreach/auth/lib/confirmAccount'
import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TConfirmAccountSchema } from './mutation.confirmAccount.schema'

export const confirmAccount = async ({ input }: TRPCHandlerParams<TConfirmAccountSchema>) => {
	try {
		const { code, email } = input
		const response = await cognitoConfirmAccount(email, code)
		return response
	} catch (error) {
		handleError(error)
	}
}
