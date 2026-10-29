import { getEnv } from '@weareinreach/env'

import { cognito } from './cognitoClient'

/**
 * Staff-only, code-less account confirmation (`AdminConfirmSignUp`) - force-confirms a user without them ever
 * entering a verification code. Unlike `resendCode`/`troubleLoggingIn`, this doesn't depend on the
 * verification email actually reaching the user, so it still works when delivery is the problem (e.g. a
 * receiving mail server silently filtering it) rather than the user simply never having tried.
 */
export const adminConfirmUser = async (email: string) => {
	const response = await cognito.adminConfirmSignUp({
		UserPoolId: getEnv('COGNITO_USER_POOL_ID'),
		Username: email.toLowerCase(),
	})

	return response
}
