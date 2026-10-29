import { InvalidParameterException, UserNotFoundException } from '@aws-sdk/client-cognito-identity-provider'

import { createLoggerInstance } from '@weareinreach/util/logger'

import { forgotPassword } from './forgotPassword'
import { resendVerificationCode } from './resendCode'

const logger = createLoggerInstance('Cognito troubleLoggingIn')

/**
 * Backs the public "Trouble logging in?" self-service flow - a single email-only entry point covering all
 * three real account states, without ever revealing to the caller which one was true:
 *
 * - No account for this email at all (`UserNotFoundException`) - do nothing, stay silent.
 * - Account exists but isn't confirmed yet - `resendVerificationCode` succeeds on its own, sending a fresh
 *   verification email. This is tried first since it's the cheaper/more specific check.
 * - Account exists and is already confirmed - `resendVerificationCode` fails with `InvalidParameterException`
 *   ("already confirmed"), so fall back to sending a password-reset email instead, since forgetting a
 *   password is the likely reason a confirmed user can't log in.
 *
 * Always resolves to the same `{success: true}` shape regardless of which branch actually ran - see
 * `resendVerificationCodeSafe`/`forgotPasswordSafe` for the same pattern applied to the two single-purpose
 * public endpoints this one sits alongside.
 */
export const troubleLoggingIn = async (email: string): Promise<{ success: true }> => {
	try {
		await resendVerificationCode(email)
	} catch (err) {
		if (err instanceof InvalidParameterException) {
			try {
				await forgotPassword({
					email,
					subject: 'Reset your password',
					message: 'Click the following link to reset your password:',
				})
			} catch (resetErr) {
				logger.error(resetErr)
			}
		} else if (err instanceof UserNotFoundException) {
			logger.info(`No account found for ${email}`)
		} else {
			logger.error(err)
		}
	}
	return { success: true }
}
