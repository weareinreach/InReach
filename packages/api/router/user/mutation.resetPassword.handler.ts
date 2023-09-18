import { resetPassword as cognitoResetPassword } from '@weareinreach/auth/lib/resetPassword'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TResetPasswordSchema } from './mutation.resetPassword.schema'

export const resetPassword = async ({ input }: TRPCHandlerParams<TResetPasswordSchema>) => {
	const { code, password, email } = input
	const response = await cognitoResetPassword({ code, email, password })
	return response
}
