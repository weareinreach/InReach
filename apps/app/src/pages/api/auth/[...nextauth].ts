// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@weareinreach/db'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CognitoProvider from 'next-auth/providers/cognito'

// import { env } from '../../../env/server.mjs'

export const authOptions: NextAuthOptions = {
	// Include user.id on session
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id
			}
			return session
		},
	},
	// Configure one or more authentication providers
	adapter: PrismaAdapter(prisma),
	providers: [
		CognitoProvider({
			clientId: process.env.COGNITO_CLIENT_ID,
			clientSecret: process.env.COGNITO_CLIENT_SECRET,
			issuer: process.env.COGNITO_ISSUER,
			allowDangerousEmailAccountLinking: true,
		}),
	],
}

export default NextAuth(authOptions)
