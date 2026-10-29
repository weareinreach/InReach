import { UserNotConfirmedException } from '@aws-sdk/client-cognito-identity-provider'
import Credentials from 'next-auth/providers/credentials'
import { type Provider } from 'next-auth/providers/index'

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

		try {
			const cognitoSession = await userLogin(credentials.email.toLowerCase(), credentials.password)
			if (cognitoSession.success === true) {
				return cognitoSession.user
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
