import { prisma, type Prisma } from '@weareinreach/db'
import { type Provider } from 'next-auth/providers'
import Credentials from 'next-auth/providers/credentials'

import { type AuthSuccess } from '../lib/cognitoClient'
import { decodeCognitoJwt } from '../lib/cognitoJwt'
import { verifyUser, CognitoSessionSchema } from '../lib/verifyUser'

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
			const cognitoSession = await verifyUser(credentials.email, credentials.password)
			if (cognitoSession.success) {
				const { session } = cognitoSession as AuthSuccess

				const parsedSession = CognitoSessionSchema.parse(session)
				const token = await decodeCognitoJwt('id', parsedSession.IdToken)

				const tokenFields = {
					access_token: parsedSession.AccessToken,
					id_token: parsedSession.IdToken,
					refresh_token: parsedSession.RefreshToken,
					expires_at: Math.round(Date.now() / 1000) + parsedSession.ExpiresIn,
					token_type: parsedSession.TokenType,
				}
				const lookupFields = {
					provider: 'cognito',
					providerAccountId: token.sub,
				}

				await prisma.user.update({
					where: { email: credentials.email },
					data: {
						accounts: {
							upsert: {
								where: { provider_providerAccountId: lookupFields },
								create: {
									type: 'credential',
									...lookupFields,
									...tokenFields,
								},
								update: tokenFields,
							},
						},
					},
				})

				return cognitoSession.user
			}
			throw 'placeholder for auth challenge'
		} catch (err) {
			throw err
		}
	},
})
