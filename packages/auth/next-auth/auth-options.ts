// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { getEnv } from '@weareinreach/config/env'
import { prisma } from '@weareinreach/db'
import { User, type NextAuthOptions } from 'next-auth'

import { cognitoCredentialProvider } from '~auth/providers/cognito'

export const authOptions: NextAuthOptions = {
	callbacks: {
		jwt: async ({ token, user }) => {
			user && (token.user = user as User)
			return token
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
	// Configure one or more authentication providers
	// adapter: PrismaAdapter(prisma),
	providers: [cognitoCredentialProvider],
	// eslint-disable-next-line node/no-process-env
	debug: process.env.NODE_ENV === 'development',
}
