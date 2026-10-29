import { adminSetTemporaryPassword } from '@weareinreach/auth/adminSetTemporaryPassword'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAdminSetTemporaryPasswordSchema } from './mutation.adminSetTemporaryPassword.schema'

/**
 * Staff-only (`viewAllUsers`) - sets a one-time temporary password with no email involved, for when the
 * normal "send a reset link" path can't reach the user. Returns the generated password so staff can relay it
 * out-of-band; see `adminSetTemporaryPassword` for why that's safe (the user must still choose their own real
 * password on next login before they're actually authenticated).
 */
const adminSetTemporaryPasswordHandler = async ({
	input,
}: TRPCHandlerParams<TAdminSetTemporaryPasswordSchema>) => {
	try {
		return await adminSetTemporaryPassword(input.email)
	} catch (error) {
		return handleError(error)
	}
}
export default adminSetTemporaryPasswordHandler
