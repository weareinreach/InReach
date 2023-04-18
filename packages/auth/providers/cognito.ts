import { type Provider } from 'next-auth/providers'
import Credentials from 'next-auth/providers/credentials'

import { userLogin } from '~auth/lib/userLogin'

export const cognitoCredentialProvider: Provider = Credentials({
	id: 'cognito',
	name: 'Cognito',
	type: 'credentials',
	credentials: {
		email: { label: 'Email', type: 'text' },
		password: { label: 'Password', type: 'password' },
	},
	authorize: async (credentials, req) => {
		if (!credentials?.email || !credentials?.password) return null
		try {
			const cognitoSession = await userLogin(credentials.email, credentials.password)
			if (cognitoSession.success === true) {
				return cognitoSession.user
			}
			throw 'placeholder for auth challenge'
		} catch (err) {
			throw err
		}
	},
})
