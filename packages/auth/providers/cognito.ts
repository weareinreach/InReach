import { UserNotConfirmedException } from '@aws-sdk/client-cognito-identity-provider'
import Credentials from 'next-auth/providers/credentials'
import { type Provider } from 'next-auth/providers/index'

import { checkRateLimit } from '@weareinreach/util/rateLimit'
import { userLogin } from '~auth/lib/userLogin'

export const cognitoCredentialProvider: Provider = Credentials({
	id: 'cognito',
	name: 'Cognito',
	type: 'credentials',
	credentials: {
		email: { label: 'Email', type: 'text' },
		password: { label: 'Password', type: 'password' },
	},
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	authorize: async (credentials, req) => {
		if (!credentials?.email || !credentials?.password) return null

		const normalizedEmail = credentials.email.toLowerCase()
		// No app-level throttling previously existed on login at all - a caller could submit unlimited
		// password guesses against a known email with nothing in this codebase slowing them down.
		const allowed = await checkRateLimit(`ratelimit:login:${normalizedEmail}`, {
			max: 10,
			windowSeconds: 15 * 60,
		})
		if (!allowed) {
			throw new Error('TooManyRequests')
		}

		try {
			const cognitoSession = await userLogin(normalizedEmail, credentials.password)
			if (cognitoSession.success === true) {
				return cognitoSession.user
			}
			// Staff-set temporary password (AdminSetUserPassword with Permanent: false) - Cognito doesn't
			// fail the login, it challenges it. The password the user just typed was the temporary one;
			// the login form re-sends it along with their chosen new password to complete the challenge.
			if (cognitoSession.success === undefined && cognitoSession.challengeName === 'NEW_PASSWORD_REQUIRED') {
				throw new Error('NewPasswordRequired')
			}
			throw new Error('CredentialsSignin')
		} catch (err) {
			// NextAuth v4 passes a thrown Error's `.message` straight through to the client as
			// `signIn()`'s `result.error` - re-throwing with this specific, stable message lets the
			// login form distinguish "account not confirmed" from every other failure (wrong
			// password, etc.) and offer a targeted fix instead of a generic error. See
			// LoginSignUp/index.tsx's `loginHandle`.
			if (err instanceof UserNotConfirmedException) {
				throw new Error('UserNotConfirmed')
			}
			throw err instanceof Error ? err : new Error('CredentialsSignin')
		}
	},
})
