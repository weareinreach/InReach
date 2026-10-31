import { TRPCError } from '@trpc/server'

import { resetPassword as cognitoResetPassword } from '@weareinreach/auth/resetPassword'
import { checkRateLimit } from '@weareinreach/util/rateLimit'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TResetPasswordSchema } from './mutation.resetPassword.schema'

const resetPassword = async ({ input }: TRPCHandlerParams<TResetPasswordSchema>) => {
	const { code, password, email } = input
	const normalizedEmail = email.toLowerCase()
	// Public, unauthenticated - a caller who knows an email can otherwise submit unlimited reset codes.
	const allowed = await checkRateLimit(`ratelimit:resetPassword:${normalizedEmail}`, {
		max: 5,
		windowSeconds: 15 * 60,
	})
	if (!allowed) {
		throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Please try again later.' })
	}
	const response = await cognitoResetPassword({ email: normalizedEmail, password, code })
	return response
}
export default resetPassword
