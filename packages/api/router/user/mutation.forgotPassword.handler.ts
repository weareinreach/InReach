import { forgotPassword as cognitoForgotPassword } from '@weareinreach/auth/lib/forgotPassword'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForgotPasswordSchema } from './mutation.forgotPassword.schema'

export const forgotPassword = async ({ input }: TRPCHandlerParams<TForgotPasswordSchema>) => {
	const response = await cognitoForgotPassword(input)
	return response
}
