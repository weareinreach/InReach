import { forgotPasswordSafe } from '@weareinreach/auth/forgotPassword'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForgotPasswordSchema } from './mutation.forgotPassword.schema'

/**
 * Public, unauthenticated - deliberately never reveals whether `input.email` has no account, an unconfirmed
 * account (Cognito refuses to reset a password for one), or a confirmed account that the reset actually went
 * out to. Staff needing the real outcome for a specific user should use `user.adminResetPassword` instead,
 * which is permissioned and returns the actual result.
 */
const forgotPassword = ({ input }: TRPCHandlerParams<TForgotPasswordSchema>) => {
	return forgotPasswordSafe(input)
}
export default forgotPassword
