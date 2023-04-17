// import { getEnv } from '@weareinreach/config/env'
import { prisma } from '@weareinreach/db'
import { JwtInvalidClaimError } from 'aws-jwt-verify/error'
import { type NextAuthOptions } from 'next-auth'

import { refreshSession, userSignOut, decodeCognitoAccessJwt } from '~auth/lib'
import { cognitoCredentialProvider } from '~auth/providers/cognito'

export const authOptions: NextAuthOptions = {
	callbacks: {
		jwt: async ({ token, user }) => {
			const { access_token } = await prisma.user_access_token.findFirstOrThrow({
				where: { id: token.user?.id ?? user.id },
			})
			if (user) {
				token.user = user
				return token
			}
			try {
				const jwt = await decodeCognitoAccessJwt(access_token ?? '')
				if (jwt) {
					return token
				} else {
					throw new Error('Unable to verify token')
				}
			} catch (error) {
				if (error instanceof JwtInvalidClaimError) {
					const refreshed = await refreshSession(token.user.id)
					token.user = refreshed
					return token
				}
				console.error(error)
				throw error
			}
		},
		session: async ({ session, token }) => {
			if (session.user) {
				session.user = token.user
			}
			return session
		},
		signIn: async ({ user }) => {
			const userProfile = await prisma.user.findFirstOrThrow({
				where: { id: user.id },
				select: { active: true },
			})
			return userProfile.active
		},
	},
	session: {
		strategy: 'jwt',
	},
	events: {
		signOut: async ({ token }) => await userSignOut(token.user.id),
	},
	// Configure one or more authentication providers
	providers: [cognitoCredentialProvider],
	// eslint-disable-next-line node/no-process-env
	debug: process.env.NODE_ENV === 'development',
}
