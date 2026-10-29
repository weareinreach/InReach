import { resendVerificationCode } from '@weareinreach/auth/resendCode'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAdminResendCodeSchema } from './mutation.adminResendCode.schema'

/**
 * Staff-only (`viewAllUsers`, same Manager+ gate as `forUserTable`) - unlike the public `resendCode`, this is
 * allowed to return the real Cognito outcome, since staff already has legitimate visibility into which users
 * exist and their verification state via the Users table itself.
 */
const adminResendCode = async ({ input }: TRPCHandlerParams<TAdminResendCodeSchema>) => {
	try {
		return await resendVerificationCode(input.email)
	} catch (error) {
		return handleError(error)
	}
}
export default adminResendCode
