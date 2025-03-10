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

		const cognitoSession = await userLogin(credentials.email.toLowerCase(), credentials.password)
		if (cognitoSession.success === true) {
			return cognitoSession.user
		}
		throw 'placeholder for auth challenge'
	},
})
