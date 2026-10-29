import { resendVerificationCodeSafe } from '@weareinreach/auth/resendCode'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TResendCodeSchema } from './mutation.resendCode.schema'

/**
 * Public, unauthenticated - deliberately never reveals whether `input.email` has no account, an
 * already-confirmed account, or an unconfirmed one (that's exactly what `resendVerificationCodeSafe` guards
 * against). Staff needing the real outcome for a specific user should use `user.adminResendCode` instead,
 * which is permissioned and returns the actual result.
 */
const resendCode = async ({ input }: TRPCHandlerParams<TResendCodeSchema>) => {
	return resendVerificationCodeSafe(input.email)
}
export default resendCode
