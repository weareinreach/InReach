import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { type NextAuthOptions } from 'next-auth'
import CognitoProvider from 'next-auth/providers/cognito'

import { prisma } from '@weareinreach/db'

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
			clientId: process.env.COGNITO_CLIENT_ID as string,
			clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
			issuer: process.env.COGNITO_ISSUER,
			allowDangerousEmailAccountLinking: true,
		}),
	],
}
