import { forgotPasswordSafe } from '@weareinreach/auth/forgotPassword'
import { checkRateLimit } from '@weareinreach/util/rateLimit'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForgotPasswordSchema } from './mutation.forgotPassword.schema'

/**
 * Public, unauthenticated - deliberately never reveals whether `input.email` has no account, an unconfirmed
 * account (Cognito refuses to reset a password for one), or a confirmed account that the reset actually went
 * out to. Staff needing the real outcome for a specific user should use `user.adminResetPassword` instead,
 * which is permissioned and returns the actual result.
 */
const forgotPassword = async ({ input }: TRPCHandlerParams<TForgotPasswordSchema>) => {
	// Rate-limited silently rather than with an error - throwing here would itself be a signal the "safe"
	// wrapper above is specifically designed never to give an outside caller. Past the limit, this just skips
	// sending another email; the response shape never changes either way.
	const allowed = await checkRateLimit(`ratelimit:forgotPassword:${input.email.toLowerCase()}`, {
		max: 3,
		windowSeconds: 60 * 60,
	})
	if (!allowed) {
		return { success: true as const }
	}
	return forgotPasswordSafe(input)
}
export default forgotPassword
