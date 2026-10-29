import { adminConfirmUser } from '@weareinreach/auth/adminConfirmUser'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAdminConfirmUserSchema } from './mutation.adminConfirmUser.schema'

/**
 * Staff-only (`viewAllUsers`, same Manager+ gate as `forUserTable`) - force-confirms a user's account without
 * a verification code, same as `adminResendCode`/`adminResetPassword` these are allowed to surface the real
 * Cognito outcome since staff already has legitimate visibility into user state via the Users table.
 */
const adminConfirmUserHandler = async ({ input }: TRPCHandlerParams<TAdminConfirmUserSchema>) => {
	try {
		return await adminConfirmUser(input.email)
	} catch (error) {
		return handleError(error)
	}
}
export default adminConfirmUserHandler
