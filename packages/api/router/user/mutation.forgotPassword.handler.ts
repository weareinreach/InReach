import { forgotPassword as cognitoForgotPassword } from '@weareinreach/auth/forgotPassword'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForgotPasswordSchema } from './mutation.forgotPassword.schema'

const forgotPassword = async ({ input }: TRPCHandlerParams<TForgotPasswordSchema>) => {
	const response = await cognitoForgotPassword(input)
	return response
}
export default forgotPassword
