import { troubleLoggingIn } from '@weareinreach/auth/troubleLoggingIn'
import { checkRateLimit } from '@weareinreach/util/rateLimit'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TTroubleLoggingInSchema } from './mutation.troubleLoggingIn.schema'

/**
 * Public, unauthenticated self-service entry point backing the login form's "Trouble logging in?" link - see
 * `troubleLoggingIn` for the full account-state handling. Deliberately never reveals which of the three real
 * states (no account / unconfirmed / confirmed) was true.
 */
const troubleLoggingInHandler = async ({ input }: TRPCHandlerParams<TTroubleLoggingInSchema>) => {
	// Rate-limited silently (same reasoning as forgotPassword/resendCode) rather than with an error, so the
	// response never differs from the normal case.
	const allowed = await checkRateLimit(`ratelimit:troubleLoggingIn:${input.email.toLowerCase()}`, {
		max: 3,
		windowSeconds: 60 * 60,
	})
	if (!allowed) {
		return { success: true as const }
	}
	return troubleLoggingIn(input.email)
}
export default troubleLoggingInHandler
