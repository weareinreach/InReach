import { forgotPassword as cognitoForgotPassword } from '@weareinreach/auth/lib/forgotPassword'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForgotPasswordSchema } from './mutation.forgotPassword.schema'

export const forgotPassword = async ({ input }: TRPCHandlerParams<TForgotPasswordSchema>) => {
	try {
		const response = await cognitoForgotPassword(input)
		return response
	} catch (error) {
		handleError(error)
	}
}
