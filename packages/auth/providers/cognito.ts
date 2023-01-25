import { type Provider } from 'next-auth/providers'
import Credentials from 'next-auth/providers/credentials'

import { verifyUser } from '../lib/verifyUser'

export const cognitoCredentialProvider: Provider = Credentials({
	name: 'Cognito',
	credentials: {
		email: { label: 'Email', type: 'text' },
		password: { label: 'Password', type: 'password' },
	},
	authorize: async (credentials, req) => {
		if (!credentials?.email || !credentials?.password) return null
		try {
			const cognitoSession = await verifyUser(credentials?.email, credentials.password)
			if (cognitoSession.success) {
				return cognitoSession.user
			}
			throw 'placeholder for auth challenge'
		} catch (err) {
			throw err
		}
	},
})
