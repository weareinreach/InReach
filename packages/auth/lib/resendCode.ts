import { createLoggerInstance } from '@weareinreach/util/logger'

import { ClientId, cognito, generateHash } from './cognitoClient'

const logger = createLoggerInstance('Cognito resendCode')

export const resendVerificationCode = async (email: string) => {
	const response = await cognito.resendConfirmationCode({
		ClientId,
		Username: email.toLowerCase(),
		SecretHash: generateHash(email.toLowerCase()),
	})
	return response
}

/**
 * Public, unauthenticated self-service entry point. Deliberately never throws and never returns anything that
 * differs based on whether the email has no account, an already-confirmed account, or an unconfirmed one -
 * any of those three states would let an anonymous caller enumerate real accounts/verification status. Logs
 * the real outcome server-side only. See #<ticket>.
 */
export const resendVerificationCodeSafe = async (email: string): Promise<{ success: true }> => {
	try {
		await resendVerificationCode(email)
	} catch (err) {
		// Expected, non-exceptional outcomes for a public caller: no account (UserNotFoundException),
		// already confirmed (InvalidParameterException), etc. - swallow all of them identically so the
		// response never reveals which one happened. Still logged for staff/debugging visibility.
		logger.error(err)
	}
	return { success: true }
}
