import { resendVerificationCodeSafe } from '@weareinreach/auth/resendCode'
import { checkRateLimit } from '@weareinreach/util/rateLimit'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TResendCodeSchema } from './mutation.resendCode.schema'

/**
 * Public, unauthenticated - deliberately never reveals whether `input.email` has no account, an
 * already-confirmed account, or an unconfirmed one (that's exactly what `resendVerificationCodeSafe` guards
 * against). Staff needing the real outcome for a specific user should use `user.adminResendCode` instead,
 * which is permissioned and returns the actual result.
 */
const resendCode = async ({ input }: TRPCHandlerParams<TResendCodeSchema>) => {
	// Rate-limited silently (same reasoning as forgotPassword's handler) rather than with an error, so the
	// response never differs from the normal case.
	const allowed = await checkRateLimit(`ratelimit:resendCode:${input.email.toLowerCase()}`, {
		max: 3,
		windowSeconds: 60 * 60,
	})
	if (!allowed) {
		return { success: true as const }
	}
	return resendVerificationCodeSafe(input.email)
}
export default resendCode
