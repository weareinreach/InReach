import { resetPassword as cognitoResetPassword } from '@weareinreach/auth/lib/resetPassword'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TResetPasswordSchema } from './mutation.resetPassword.schema'

export const resetPassword = async ({ ctx, input }: TRPCHandlerParams<TResetPasswordSchema>) => {
	try {
		const { code, password, email } = input
		const response = await cognitoResetPassword({ code, email, password })
		return response
	} catch (error) {
		handleError(error)
	}
}
