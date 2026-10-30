import { changePasswordResponse } from './changePassword'
import { type AuthResult } from './cognitoClient'
import { userLogin } from './userLogin'

export class InvalidTemporaryPasswordError extends Error {}
export class UnexpectedChallengeError extends Error {}

/**
 * Completes the `NEW_PASSWORD_REQUIRED` challenge from a staff-set temporary password
 * (`adminSetTemporaryPassword`). Re-runs the initial auth step to get a fresh challenge session (the one from
 * the original login attempt in `providers/cognito.ts` never reaches the client - only a generic
 * "NewPasswordRequired" marker does, since NextAuth's `authorize()` can only return a user or throw a
 * message), then immediately responds to it with the user's chosen new password. The temporary password is
 * never exposed beyond this one exchange.
 */
export const completeNewPasswordChallenge = async (
	email: string,
	temporaryPassword: string,
	newPassword: string
): Promise<AuthResult> => {
	const attempt = await userLogin(email, temporaryPassword)

	if (attempt.success === true) {
		return attempt
	}
	if (attempt.success === false) {
		throw new InvalidTemporaryPasswordError('Temporary password is incorrect or has expired.')
	}
	if (attempt.challengeName !== 'NEW_PASSWORD_REQUIRED') {
		throw new UnexpectedChallengeError(
			`Expected a NEW_PASSWORD_REQUIRED challenge, got ${attempt.challengeName}`
		)
	}

	return changePasswordResponse(email, newPassword, attempt.challengeSession)
}
