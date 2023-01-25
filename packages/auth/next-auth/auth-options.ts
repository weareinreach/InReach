import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@weareinreach/db'
import { User, type NextAuthOptions } from 'next-auth'

import { cognitoCredentialProvider } from '../providers/cognito'

export const authOptions: NextAuthOptions = {
	// Include user.id on session
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
	},
	// Configure one or more authentication providers
	adapter: PrismaAdapter(prisma),
	providers: [cognitoCredentialProvider],
}
