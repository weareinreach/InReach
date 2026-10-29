import { forgotPassword } from '@weareinreach/auth/forgotPassword'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAdminResetPasswordSchema } from './mutation.adminResetPassword.schema'

/**
 * Staff-only (`viewAllUsers`, same Manager+ gate as `forUserTable`) - unlike the public `forgotPassword`,
 * this is allowed to return the real Cognito outcome (e.g. "can't reset - this user was never confirmed"),
 * since staff already has legitimate visibility into which users exist via the Users table itself.
 */
const adminResetPassword = async ({ input }: TRPCHandlerParams<TAdminResetPasswordSchema>) => {
	try {
		return await forgotPassword(input)
	} catch (error) {
		return handleError(error)
	}
}
export default adminResetPassword
