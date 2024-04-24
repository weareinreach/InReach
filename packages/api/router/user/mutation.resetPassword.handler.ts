import { resetPassword as cognitoResetPassword } from '@weareinreach/auth/resetPassword'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TResetPasswordSchema } from './mutation.resetPassword.schema'

const resetPassword = async ({ input }: TRPCHandlerParams<TResetPasswordSchema>) => {
	const { code, password, email } = input
	const response = await cognitoResetPassword({ email: email.toLowerCase(), password, code })
	return response
}
export default resetPassword
